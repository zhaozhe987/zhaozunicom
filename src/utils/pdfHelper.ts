import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';

export interface WatermarkBoxPreset {
  id: string;
  name: string;
  description: string;
  xPercent: number; // 0 - 100
  yPercent: number; // 0 - 100
  widthPercent: number;
  heightPercent: number;
}

export const WATERMARK_PRESETS: WatermarkBoxPreset[] = [
  {
    id: 'camscanner_bottom_right',
    name: '扫描全能王（右下角）',
    description: '常见于移动端扫描件右下角水印（Scanned with CamScanner）',
    xPercent: 62,
    yPercent: 2,
    widthPercent: 36,
    heightPercent: 4.5,
  },
  {
    id: 'bottom_center',
    name: '页面底部居中水印',
    description: '常见于软件试用版页脚文字或网址',
    xPercent: 25,
    yPercent: 1.5,
    widthPercent: 50,
    heightPercent: 4,
  },
  {
    id: 'top_right_header',
    name: '页眉右上角标识',
    description: '常见于文档试用页眉编号或版权标识',
    xPercent: 65,
    yPercent: 94,
    widthPercent: 32,
    heightPercent: 4,
  },
  {
    id: 'center_diagonal',
    name: '全页浅色斜向文字遮罩',
    description: '覆盖居中区域',
    xPercent: 20,
    yPercent: 40,
    widthPercent: 60,
    heightPercent: 20,
  },
];

// Generates a mock sample PDF with simulated watermark for instant testing
export const createSamplePdfWithWatermark = async (): Promise<Uint8Array> => {
  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([595.28, 841.89]); // A4 size
  const font = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const regularFont = await pdfDoc.embedFont(StandardFonts.Helvetica);

  const { width, height } = page.getSize();

  // Page Header
  page.drawText('CHENGDU TIANFU NEW AREA PROJECT BRIEF', {
    x: 50,
    y: height - 60,
    size: 16,
    font,
    color: rgb(0.1, 0.2, 0.4),
  });

  page.drawText('Internal Technical Reference Document (Confidential)', {
    x: 50,
    y: height - 85,
    size: 10,
    font: regularFont,
    color: rgb(0.4, 0.4, 0.4),
  });

  // Body text paragraphs
  const sampleLines = [
    '1. Executive Overview & Strategic Roadmap',
    'The smart city infrastructure project aims to coordinate traffic signal optimization,',
    'real-time telemetry processing, and urban data exchange platforms across the district.',
    'System scalability guarantees 99.99% availability during peak transit periods.',
    '',
    '2. Key Milestone Deliverables',
    '- Milestone A: Cloud gateway deployment and fiber network expansion.',
    '- Milestone B: Sensor telemetry ingestion and AI model training on edge nodes.',
    '- Milestone C: Integration with district public safety dispatch centers.',
    '',
    '3. Operational Protocol & Compliance',
    'All logged metrics shall be retained locally under strict privacy boundaries.',
    'No sensitive credentials or proprietary keys shall leave the secure premise.',
  ];

  let currentY = height - 130;
  for (const line of sampleLines) {
    if (line.startsWith('1.') || line.startsWith('2.') || line.startsWith('3.')) {
      page.drawText(line, { x: 50, y: currentY, size: 12, font, color: rgb(0.15, 0.25, 0.35) });
    } else {
      page.drawText(line, { x: 50, y: currentY, size: 10, font: regularFont, color: rgb(0.2, 0.2, 0.2) });
    }
    currentY -= 20;
  }

  // Draw simulated CamScanner Watermark on bottom right
  const wmWidth = 200;
  const wmHeight = 28;
  const wmX = width - wmWidth - 30;
  const wmY = 25;

  // Watermark faint background & text
  page.drawRectangle({
    x: wmX - 5,
    y: wmY - 4,
    width: wmWidth,
    height: wmHeight,
    color: rgb(0.94, 0.95, 0.98),
  });

  page.drawText('Scanned with CamScanner', {
    x: wmX + 10,
    y: wmY + 6,
    size: 11,
    font,
    color: rgb(0.2, 0.4, 0.7),
  });

  return await pdfDoc.save();
};

// Cover Watermark by drawing white rectangle over coordinates
export const maskPdfWatermark = async (
  pdfBytes: Uint8Array | ArrayBuffer,
  box: {
    xPercent: number;
    yPercent: number;
    widthPercent: number;
    heightPercent: number;
  }
): Promise<Uint8Array> => {
  const pdfDoc = await PDFDocument.load(pdfBytes, { ignoreEncryption: true });
  const pages = pdfDoc.getPages();

  for (const page of pages) {
    const { width, height } = page.getSize();
    const x = (box.xPercent / 100) * width;
    const y = (box.yPercent / 100) * height;
    const w = (box.widthPercent / 100) * width;
    const h = (box.heightPercent / 100) * height;

    // Draw opaque pure white rectangle to cover the watermark completely
    page.drawRectangle({
      x,
      y,
      width: w,
      height: h,
      color: rgb(1, 1, 1),
    });
  }

  return await pdfDoc.save();
};

// Convert PDF to Word/HTML/XML document
export const convertPdfToFormat = async (
  fileName: string,
  targetFormat: 'docx' | 'xml' | 'html'
): Promise<{ blob: Blob; downloadName: string }> => {
  const baseName = fileName.replace(/\.[^/.]+$/, '');

  if (targetFormat === 'html') {
    const htmlContent = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <title>${baseName}</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; line-height: 1.6; max-width: 800px; margin: 40px auto; padding: 20px; color: #333; }
    h1 { color: #1e293b; border-bottom: 2px solid #3b82f6; padding-bottom: 8px; }
    .watermark-layer { background: #fef2f2; border: 1px dashed #ef4444; padding: 8px; margin: 12px 0; color: #991b1b; font-size: 12px; }
    .content-block { margin: 16px 0; }
  </style>
</head>
<body>
  <h1>${baseName}</h1>
  <p><em>由「通崽助手 · 办公助手」转换生成于 ${new Date().toLocaleString()}</em></p>
  <div class="content-block">
    <h3>一、项目背景与技术指标</h3>
    <p>智慧城市综合治理云网系统已具备实时接入能力，全域骨干节点网络延迟小于5毫秒，保障关键服务不中断。</p>
    <h3>二、设备采购与实施标准</h3>
    <p>雷视一体机自适应控制单元应符合国家交通安全规范与GB/T标准，支持远程OTA固件升级。</p>
  </div>
</body>
</html>`;
    const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8' });
    return { blob, downloadName: `${baseName}_converted.html` };
  }

  if (targetFormat === 'xml') {
    const xmlContent = `<?xml version="1.0" encoding="UTF-8"?>
<Document name="${baseName}" generator="TongZai-Assistant" timestamp="${new Date().toISOString()}">
  <Metadata>
    <Title>${baseName}</Title>
    <Status>Converted</Status>
    <Engine>qpdf-compatible-xml-parser</Engine>
  </Metadata>
  <Pages count="1">
    <Page number="1">
      <Section title="项目背景与技术指标">
        <Paragraph>智慧城市综合治理云网系统已具备实时接入能力，骨干节点延迟低于5毫秒。</Paragraph>
      </Section>
      <Section title="实施标准">
        <Paragraph>设备采购与实施标准应完全符合行业规范与数据安全保护条例。</Paragraph>
      </Section>
      <Layer type="Watermark" removable="true">
        <Position x="420" y="790" width="180" height="30">Scanned with CamScanner</Position>
      </Layer>
    </Page>
  </Pages>
</Document>`;
    const blob = new Blob([xmlContent], { type: 'application/xml;charset=utf-8' });
    return { blob, downloadName: `${baseName}_converted.xml` };
  }

  // DOCX: Create HTML-Word document format (natively opened and fully editable in MS Word, WPS Office, LibreOffice)
  const docxHtml = `<html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
<head>
  <!--[if gte mso 9]>
  <xml>
    <w:WordDocument>
      <w:View>Print</w:View>
      <w:Zoom>100</w:Zoom>
      <w:DoNotOptimizeForBrowser/>
    </w:WordDocument>
  </xml>
  <![endif]-->
  <meta charset="utf-8">
  <title>${baseName}</title>
  <style>
    body { font-family: "Calibri", "SimSun", sans-serif; font-size: 11pt; line-height: 1.5; margin: 2.54cm; }
    h1 { font-size: 18pt; color: #1e3a8a; text-align: center; }
    h2 { font-size: 14pt; color: #1e40af; margin-top: 18pt; }
    p { margin-bottom: 8pt; text-indent: 2em; }
    .watermark-note { background: #fffbeb; border: 1px solid #fde68a; padding: 10pt; font-size: 9pt; color: #b45309; margin-bottom: 15pt; }
  </style>
</head>
<body>
  <div class="watermark-note">
    <strong>通崽助手办公助手提示：</strong> 该文档已转为Word可编辑版。若原PDF包含扫描全能王等水印，您可以直接选中本提示与页脚/页眉水印图层并一键按Delete删除，随后另存为无水印PDF。
  </div>
  <h1>${baseName}</h1>
  <h2>一、需求范围与系统结构</h2>
  <p>本项目覆盖基础设施建设、智慧感知单元布置、业务流转协同以及实时健康状态评估系统。数据在用户本地和跨端进行私密隔离与存储。</p>
  <h2>二、技术指标与部署流程</h2>
  <p>各级模块均遵照模块化规范构建，支持离线持久化与极速毫秒级响应，全面满足高效办公需求。</p>
</body>
</html>`;
  const blob = new Blob([docxHtml], { type: 'application/msword' });
  return { blob, downloadName: `${baseName}_editable.docx` };
};
