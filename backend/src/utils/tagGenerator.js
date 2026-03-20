export function generateTags(text) {
    const keywords = ["AI", "React", "Startup", "Web"];

    return keywords.filter((k) => text.toLowerCase().includes(k.toLowerCase()));
}
