// n8n Code-Node: "Google-Bewertungen mappen" (Workflow /webhook/google-reviews)
//
// Eingang: Antwort der Places API (New), siehe google-reviews.md.
// Ausgang: schlankes JSON, das main.js (setupGoogleReviews) erwartet.

const place = $input.first().json;

const reviews = (place.reviews || [])
    .map((r) => ({
        author: (r.authorAttribution && r.authorAttribution.displayName) || 'Google-Nutzer',
        rating: Number(r.rating) || 0,
        time: r.relativePublishTimeDescription || '',
        text: (r.text && r.text.text) || '',
    }))
    .filter((r) => r.rating > 0 && r.text.trim() !== '');

return [{
    json: {
        rating: Number(place.rating) || 0,
        total: Number(place.userRatingCount) || reviews.length,
        reviews,
    },
}];
