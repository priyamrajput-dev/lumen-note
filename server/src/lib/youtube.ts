import { YoutubeTranscript } from "youtube-transcript";
import { ValidationError } from "../common/utils/app-error.js";

export function extractYoutubeVideoId(input: string): string | null {
  const trimmed = input.trim();

  // If already 11-character video ID
  if (/^[a-zA-Z0-9_-]{11}$/.test(trimmed)) {
    return trimmed;
  }

  try {
    const url = new URL(trimmed.startsWith("http://") || trimmed.startsWith("https://") ? trimmed : `https://${trimmed}`);
    
    // youtu.be/<id>
    if (url.hostname === "youtu.be" || url.hostname.endsWith(".youtu.be")) {
      const id = url.pathname.slice(1).split("/")[0]?.split("?")[0];
      if (id && /^[a-zA-Z0-9_-]{11}$/.test(id)) return id;
    }

    // youtube.com domains
    if (url.hostname.includes("youtube.com")) {
      // ?v=<id> (handles any position in query string)
      const v = url.searchParams.get("v");
      if (v && /^[a-zA-Z0-9_-]{11}$/.test(v)) return v;

      // /embed/<id>, /shorts/<id>, /live/<id>, /v/<id>
      const pathParts = url.pathname.split("/").filter(Boolean);
      if (["shorts", "embed", "live", "v"].includes(pathParts[0]) && pathParts[1]) {
        const id = pathParts[1].split("?")[0];
        if (/^[a-zA-Z0-9_-]{11}$/.test(id)) return id;
      }
    }
  } catch {
    // Fall back to regex
  }

  const regexMatch = trimmed.match(
    /(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|shorts\/|live\/|watch\?.*&?v=))([\w-]{11})/,
  );
  return regexMatch ? regexMatch[1] : null;
}

function decodeEntities(text: string): string {
  return text
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, "\"")
    .replace(/&#39;/g, "'")
    .replace(/&apos;/g, "'")
    .replace(/&#x([0-9a-fA-F]+);/g, (_, hex) => String.fromCodePoint(parseInt(hex, 16)))
    .replace(/&#(\d+);/g, (_, dec) => String.fromCodePoint(parseInt(dec, 10)));
}

function parseTranscriptXml(xml: string): string {
  // Try srv3 format (<p t="..." d="..."><s>...</s></p>)
  const pRegex = /<p\s+t="(\d+)"\s+d="(\d+)"[^>]*>([\s\S]*?)<\/p>/g;
  let match: RegExpExecArray | null;
  const parts: string[] = [];
  while ((match = pRegex.exec(xml)) !== null) {
    const inner = match[3];
    let text = "";
    const sRegex = /<s[^>]*>([^<]*)<\/s>/g;
    let sMatch: RegExpExecArray | null;
    while ((sMatch = sRegex.exec(inner)) !== null) {
      text += sMatch[1];
    }
    if (!text) {
      text = inner.replace(/<[^>]+>/g, "");
    }
    text = decodeEntities(text).trim();
    if (text) {
      parts.push(text);
    }
  }
  if (parts.length > 0) return parts.join(" ");

  // Classic format (<text start="..." dur="...">...</text>)
  const RE_XML_TRANSCRIPT = /<text start="([^"]*)" dur="([^"]*)">([^<]*)<\/text>/g;
  const classic = [...xml.matchAll(RE_XML_TRANSCRIPT)];
  return classic.map((r) => decodeEntities(r[3]).trim()).filter(Boolean).join(" ");
}

interface InnerTubeCaptionTrack {
  baseUrl: string;
  name?: { runs?: Array<{ text: string }>; simpleText?: string };
  languageCode: string;
  kind?: string;
}

export interface YoutubeExtractResult {
  videoId: string;
  title: string;
  author: string;
  description: string;
  content: string;
  hasCaptions: boolean;
}

export async function fetchYoutubeTranscript(url: string): Promise<YoutubeExtractResult> {
  const videoId = extractYoutubeVideoId(url);

  if (!videoId) {
    throw new ValidationError("Enter a valid YouTube URL (e.g., https://www.youtube.com/watch?v=... or https://youtu.be/...)");
  }

  let title = "";
  let author = "";
  let description = "";
  let captionTracks: InnerTubeCaptionTrack[] = [];
  let isVideoAccessible = true;

  // Step 1: Query YouTube official oEmbed API (100% reliable, never blocked for public videos)
  try {
    const oembedResp = await fetch(
      `https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`,
    );
    if (oembedResp.ok) {
      const oembedData = (await oembedResp.json()) as {
        title?: string;
        author_name?: string;
      };
      if (oembedData.title) title = oembedData.title;
      if (oembedData.author_name) author = oembedData.author_name;
    } else if (oembedResp.status === 404) {
      isVideoAccessible = false;
    }
  } catch (err) {
    console.warn("YouTube oEmbed fetch warning:", err);
  }

  // Step 2: Fetch watch page HTML to extract full description and player response
  try {
    const pageResp = await fetch(`https://www.youtube.com/watch?v=${videoId}`, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36",
        "Accept-Language": "en-US,en;q=0.9",
      },
    });

    if (pageResp.ok) {
      const html = await pageResp.text();

      // Extract full description from meta tags
      const metaDesc =
        html.match(/<meta\s+name="description"\s+content="([^"]*)"/i) ||
        html.match(/<meta\s+property="og:description"\s+content="([^"]*)"/i);
      if (metaDesc && metaDesc[1] && !description) {
        description = decodeEntities(metaDesc[1]);
      }

      // Extract ytInitialPlayerResponse JSON
      const playerMatch = html.match(/ytInitialPlayerResponse\s*=\s*({.+?});/);
      if (playerMatch) {
        try {
          const parsed = JSON.parse(playerMatch[1]) as {
            videoDetails?: {
              title?: string;
              author?: string;
              shortDescription?: string;
            };
            captions?: {
              playerCaptionsTracklistRenderer?: {
                captionTracks?: InnerTubeCaptionTrack[];
              };
            };
          };
          if (!title && parsed.videoDetails?.title) {
            title = parsed.videoDetails.title;
          }
          if (!author && parsed.videoDetails?.author) {
            author = parsed.videoDetails.author;
          }
          if (parsed.videoDetails?.shortDescription) {
            description = parsed.videoDetails.shortDescription;
          }
          if (parsed.captions?.playerCaptionsTracklistRenderer?.captionTracks) {
            captionTracks = parsed.captions.playerCaptionsTracklistRenderer.captionTracks;
          }
          isVideoAccessible = true;
        } catch {
          // JSON parsing failed, proceed with meta tags
        }
      }
    }
  } catch (err) {
    console.warn("YouTube watch page scrape warning:", err);
  }

  // Step 3: Query YouTube InnerTube API if metadata or caption tracks are still missing
  if (!description || captionTracks.length === 0) {
    try {
      const resp = await fetch("https://www.youtube.com/youtubei/v1/player?prettyPrint=false", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "User-Agent": "com.google.android.youtube/20.10.38 (Linux; U; Android 14)",
        },
        body: JSON.stringify({
          context: {
            client: {
              clientName: "ANDROID",
              clientVersion: "20.10.38",
            },
          },
          videoId,
        }),
      });

      if (resp.ok) {
        const data = (await resp.json()) as {
          videoDetails?: {
            title?: string;
            author?: string;
            shortDescription?: string;
          };
          captions?: {
            playerCaptionsTracklistRenderer?: {
              captionTracks?: InnerTubeCaptionTrack[];
            };
          };
        };
        if (!title && data?.videoDetails?.title) title = data.videoDetails.title;
        if (!author && data?.videoDetails?.author) author = data.videoDetails.author;
        if (!description && data?.videoDetails?.shortDescription) {
          description = data.videoDetails.shortDescription;
        }
        if (captionTracks.length === 0 && data?.captions?.playerCaptionsTracklistRenderer?.captionTracks) {
          captionTracks = data.captions.playerCaptionsTracklistRenderer.captionTracks;
        }
        isVideoAccessible = true;
      }
    } catch (err) {
      console.warn("YouTube InnerTube metadata fetch warning:", err);
    }
  }

  // Step 4: Attempt transcript extraction using youtube-transcript package
  try {
    const segments = await YoutubeTranscript.fetchTranscript(videoId);
    const content = segments
      .map((segment) => segment.text)
      .join(" ")
      .trim();

    if (content && content.length > 0) {
      return {
        videoId,
        title: title || `YouTube Video (${videoId})`,
        author: author || "YouTube Channel",
        description,
        content,
        hasCaptions: true,
      };
    }
  } catch {
    // Fall through to direct caption tracks extraction
  }

  // Step 5: Attempt direct fetch from caption tracks
  if (captionTracks.length > 0) {
    // Prefer English if available, otherwise first available track
    const preferredTrack =
      captionTracks.find((t) => t.languageCode?.toLowerCase().startsWith("en")) ||
      captionTracks[0];

    if (preferredTrack?.baseUrl) {
      try {
        const resp = await fetch(preferredTrack.baseUrl, {
          headers: {
            "User-Agent":
              "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36",
          },
        });

        if (resp.ok) {
          const xml = await resp.text();
          if (xml && xml.trim().length > 0) {
            const content = parseTranscriptXml(xml);
            if (content && content.length > 0) {
              return {
                videoId,
                title: title || `YouTube Video (${videoId})`,
                author: author || "YouTube Channel",
                description,
                content,
                hasCaptions: true,
              };
            }
          }
        }
      } catch (err) {
        console.warn("Direct caption track download warning:", err);
      }
    }
  }

  // Step 6: Graceful fallback - if captions unavailable, ingest video metadata and description
  if (title || description) {
    const fallbackSections = [
      title ? `# ${title}` : `# YouTube Video: ${videoId}`,
      author ? `**Channel**: ${author}` : "",
      `**YouTube URL**: https://www.youtube.com/watch?v=${videoId}`,
      description ? `## Video Overview & Description\n${description}` : "",
      "*(Note: Closed captions were unavailable for this video; ingested video metadata and overview)*",
    ].filter(Boolean);

    return {
      videoId,
      title: title || `YouTube: ${videoId}`,
      author: author || "YouTube Channel",
      description,
      content: fallbackSections.join("\n\n"),
      hasCaptions: false,
    };
  }

  if (!isVideoAccessible) {
    throw new ValidationError(
      "This YouTube video could not be found or is private. Please verify that the video is public and that the link is correct.",
    );
  }

  throw new ValidationError(
    "Could not extract video details. Please verify the YouTube URL is publicly accessible.",
  );
}
