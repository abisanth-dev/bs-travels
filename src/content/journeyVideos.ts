/**
 * AI-generated clips (Google Veo) for the destination journey, keyed by
 * journey stop slug. Files live in public/videos/journey and are added with
 * scripts/add-journey-video.sh. A stop without a clip shows its 3D landmark.
 */
export const JOURNEY_VIDEOS: Record<string, { src: string; poster: string }> = {};
