
export const readAsText = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => resolve(e.target?.result as string || '');
    reader.onerror = (e) => reject(e);
    reader.readAsText(file);
  });
};

export const downloadDocx = (content: string, filename: string) => {
  // Simplest way to export text to a "word-like" file in browser without massive libs
  // for this demo, we'll use a blob with application/vnd.openxmlformats-officedocument.wordprocessingml.document
  // but since we aren't using a heavy docx builder here, we provide a rich text format / plain text fallback
  // for actual production, we'd use 'docx' library. 
  // Here we use a hidden link to trigger download of the text content.
  const element = document.createElement("a");
  const file = new Blob([content], {type: 'text/plain;charset=utf-8'});
  element.href = URL.createObjectURL(file);
  element.download = filename.endsWith('.docx') ? filename : `${filename}.txt`;
  document.body.appendChild(element);
  element.click();
  document.body.removeChild(element);
};
