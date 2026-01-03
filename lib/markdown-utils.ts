/**
 * Simple Markdown to HTML converter
 * Converts basic markdown syntax to HTML
 */
export function markdownToHtml(markdown: string): string {
    if (!markdown) return '';
    
    let html = markdown;
    
    // Bold
    html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    
    // Italic (after bold to avoid conflicts)
    html = html.replace(/\*(.*?)\*/g, '<em>$1</em>');
    
    // Links
    html = html.replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2" class="text-rejimde-blue underline hover:text-rejimde-blueDark" target="_blank" rel="noopener noreferrer">$1</a>');
    
    // Unordered Lists
    html = html.replace(/^- (.+)$/gm, '<li>$1</li>');
    html = html.replace(/(<li>.*<\/li>\n?)+/g, '<ul class="list-disc list-inside ml-4 my-2">$&</ul>');
    
    // Ordered Lists
    html = html.replace(/^\d+\. (.+)$/gm, '<li>$1</li>');
    html = html.replace(/(<li>.*<\/li>\n?)+/g, '<ol class="list-decimal list-inside ml-4 my-2">$&</ol>');
    
    // Line breaks
    html = html.replace(/\n/g, '<br />');
    
    return html;
}

/**
 * Check if content is HTML or Markdown
 * Simple heuristic: if it contains HTML tags, assume it's HTML
 */
export function isHtml(content: string): boolean {
    if (!content) return false;
    return /<[a-z][\s\S]*>/i.test(content);
}

/**
 * Convert content to HTML, detecting if it's markdown or already HTML
 */
export function renderContent(content: string): string {
    if (!content) return '';
    
    // If it's already HTML, return as is
    if (isHtml(content)) {
        return content;
    }
    
    // Otherwise, convert markdown to HTML
    return markdownToHtml(content);
}
