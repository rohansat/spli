const MAX_CONTENT_LENGTH = 50_000;

export interface ParsedDocument {
  name: string;
  content: string;
  sizeBytes: number;
  extracted: boolean;
}

export async function readDocumentContent(file: File): Promise<ParsedDocument> {
  const ext = file.name.split('.').pop()?.toLowerCase() ?? '';
  const textExtensions = ['txt', 'md', 'csv', 'json', 'xml', 'html', 'log'];

  if (textExtensions.includes(ext) || file.type.startsWith('text/')) {
    const content = await file.text();
    return {
      name: file.name,
      content: content.slice(0, MAX_CONTENT_LENGTH),
      sizeBytes: file.size,
      extracted: true,
    };
  }

  if (file.size < 200_000) {
    try {
      const content = await file.text();
      const printableRatio =
        content.length > 0
          ? (content.match(/[\x20-\x7E\n\r\t]/g)?.length ?? 0) / content.length
          : 0;

      if (printableRatio > 0.85) {
        return {
          name: file.name,
          content: content.slice(0, MAX_CONTENT_LENGTH),
          sizeBytes: file.size,
          extracted: true,
        };
      }
    } catch {
      // fall through to placeholder
    }
  }

  return {
    name: file.name,
    content: `[Uploaded file: ${file.name} (${formatFileSize(file.size)}). This is a binary document — text could not be extracted automatically. Please describe its contents or paste relevant excerpts for analysis.]`,
    sizeBytes: file.size,
    extracted: false,
  };
}

export async function readDocumentContents(
  files: FileList | File[]
): Promise<ParsedDocument[]> {
  const list = Array.from(files);
  return Promise.all(list.map(readDocumentContent));
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
