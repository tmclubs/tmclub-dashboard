export const isHtmlContent = (content: string): boolean => {
  const htmlPattern = /<[^>]+>/;
  return htmlPattern.test(content);
};

export const htmlToMarkdown = (html: string): string => {
  if (!html) return '';
  let markdown = html;

  markdown = markdown.replace(/<h([1-6])(?:[^>]*)>(.*?)<\/h[1-6]>/gis, (_, level, content) => {
    const headerLevel = '#'.repeat(parseInt(level));
    const cleanContent = content.replace(/<[^>]+>/g, '').trim();
    return `${headerLevel} ${cleanContent}\n\n`;
  });

  markdown = markdown.replace(/<pre(?:[^>]*)><code(?:[^>]*)>(.*?)<\/code><\/pre>/gis, (_, content) => {
    const cleanContent = content
      .replace(/<[^>]+>/g, '')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&amp;/g, '&')
      .trim();
    return '```\n' + cleanContent + '\n```\n\n';
  });

  markdown = markdown.replace(/<code(?:[^>]*)>(.*?)<\/code>/gi, (_, content) => {
    const cleanContent = content.replace(/<[^>]+>/g, '').trim();
    return `\`${cleanContent}\``;
  });

  markdown = markdown.replace(/<blockquote(?:[^>]*)>(.*?)<\/blockquote>/gis, (_, content) => {
    const cleanContent = content
      .replace(/<p(?:[^>]*)>/gi, '')
      .replace(/<\/p>/gi, '\n')
      .replace(/<[^>]+>/g, '')
      .trim();
    const lines = cleanContent.split('\n').filter((line: string) => line.trim());
    const quotedLines = lines.map((line: string) => `> ${line.trim()}`).join('\n');
    return quotedLines + '\n\n';
  });

  markdown = markdown.replace(/<ul(?:[^>]*)>(.*?)<\/ul>/gis, (_, content) => {
    const items = content.match(/<li(?:[^>]*)>(.*?)<\/li>/gis);
    if (items) {
      const listItems = items.map((item: string) => {
        const itemContent = item
          .replace(/<li(?:[^>]*)>/gi, '')
          .replace(/<\/li>/gi, '')
          .replace(/<[^>]+>/g, '')
          .trim();
        return `- ${itemContent}`;
      }).join('\n');
      return `${listItems}\n\n`;
    }
    return '';
  });

  markdown = markdown.replace(/<ol(?:[^>]*)>(.*?)<\/ol>/gis, (_, content) => {
    const items = content.match(/<li(?:[^>]*)>(.*?)<\/li>/gis);
    if (items) {
      const listItems = items.map((item: string, index: number) => {
        const itemContent = item
          .replace(/<li(?:[^>]*)>/gi, '')
          .replace(/<\/li>/gi, '')
          .replace(/<[^>]+>/g, '')
          .trim();
        return `${index + 1}. ${itemContent}`;
      }).join('\n');
      return `${listItems}\n\n`;
    }
    return '';
  });

  markdown = markdown.replace(/<(strong|b)(?:[^>]*)>(.*?)<\/(strong|b)>/gi, '**$2**');
  markdown = markdown.replace(/<(em|i)(?:[^>]*)>(.*?)<\/(em|i)>/gi, '*$2*');
  markdown = markdown.replace(/<a(?:[^>]*)\s+href=["']([^"']+)["'](?:[^>]*)>(.*?)<\/a>/gi, '[$3]($1)');
  markdown = markdown.replace(/<img(?:[^>]*)\s+src=["']([^"']+)["'](?:[^>]*)\s+alt=["']([^"']*)["'](?:[^>]*)\/?>(?!<\/img>)/gi, '![$2]($1)');
  markdown = markdown.replace(/<img(?:[^>]*)\s+alt=["']([^"']*)["'](?:[^>]*)\s+src=["']([^"']+)["'](?:[^>]*)\/?>(?!<\/img>)/gi, '![$1]($2)');
  markdown = markdown.replace(/<img(?:[^>]*)\s+src=["']([^"']+)["'](?:[^>]*)\/?>(?!<\/img>)/gi, '![]($1)');
  markdown = markdown.replace(/<hr\s*\/?>(?!<\/hr>)/gi, '---\n\n');
  markdown = markdown.replace(/<p(?:[^>]*)>(.*?)<\/p>/gis, '$1\n\n');
  markdown = markdown.replace(/<br\s*\/?>(?!<\/br>)/gi, '\n');
  markdown = markdown.replace(/<[^>]+>/g, '');
  markdown = markdown
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, ' ');
  markdown = markdown
    .replace(/\n\s*\n\s*\n/g, '\n\n')
    .replace(/^\s+|\s+$/g, '')
    .replace(/[ \t]+/g, ' ');

  return markdown;
};