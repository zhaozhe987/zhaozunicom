import React, { useState } from 'react';
import {
  FileText,
  Upload,
  Layers,
  FileCode,
  FileCheck,
  Download,
  Clock,
  Sparkles,
  ShieldAlert,
  Sliders,
  CheckCircle2,
  AlertCircle,
  FileSpreadsheet,
  FileType,
  RefreshCw,
  FolderOpen,
} from 'lucide-react';
import { OfficeJob, AppNotification } from '../types';
import {
  WATERMARK_PRESETS,
  createSamplePdfWithWatermark,
  maskPdfWatermark,
  convertPdfToFormat,
} from '../utils/pdfHelper';

interface OfficeModuleProps {
  officeJobs: OfficeJob[];
  setOfficeJobs: React.Dispatch<React.SetStateAction<OfficeJob[]>>;
  addNotification: (notif: Omit<AppNotification, 'id' | 'timestamp' | 'isRead'>) => void;
}

export const OfficeModule: React.FC<OfficeModuleProps> = ({
  officeJobs,
  setOfficeJobs,
  addNotification,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'watermark' | 'convert' | 'queue'>('watermark');

  // File state
  const [currentFile, setCurrentFile] = useState<{
    name: string;
    size: number;
    bytes?: Uint8Array;
  } | null>(null);

  // Watermark Masking states
  const [selectedPresetId, setSelectedPresetId] = useState<string>('camscanner_bottom_right');
  const [customBox, setCustomBox] = useState({
    xPercent: 62,
    yPercent: 2,
    widthPercent: 36,
    heightPercent: 4.5,
  });

  // Conversion states
  const [targetFormat, setTargetFormat] = useState<'docx' | 'xml' | 'html'>('docx');

  // Load sample PDF with CamScanner watermark
  const handleLoadSamplePdf = async () => {
    try {
      const sampleBytes = await createSamplePdfWithWatermark();
      setCurrentFile({
        name: '成都市天府新区项目技术方案_含扫描全能王水印.pdf',
        size: sampleBytes.byteLength,
        bytes: sampleBytes,
      });
    } catch (err) {
      console.error(err);
    }
  };

  // Upload user PDF
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const arrayBuffer = reader.result as ArrayBuffer;
      setCurrentFile({
        name: file.name,
        size: file.size,
        bytes: new Uint8Array(arrayBuffer),
      });
    };
    reader.readAsArrayBuffer(file);
  };

  // Preset selection handler
  const handlePresetSelect = (presetId: string) => {
    setSelectedPresetId(presetId);
    const p = WATERMARK_PRESETS.find((item) => item.id === presetId);
    if (p) {
      setCustomBox({
        xPercent: p.xPercent,
        yPercent: p.yPercent,
        widthPercent: p.widthPercent,
        heightPercent: p.heightPercent,
      });
    }
  };

  // 1. Submit Watermark Mask Task (遮盖法)
  const handleSubmitWatermarkMask = async () => {
    if (!currentFile || !currentFile.bytes) return;

    const jobId = `job_${Date.now()}`;
    const newJob: OfficeJob = {
      id: jobId,
      fileName: currentFile.name,
      fileSize: currentFile.size,
      action: 'watermark_mask',
      status: 'queued',
      progress: 0,
      createdAt: new Date().toLocaleTimeString(),
      watermarkBox: {
        x: customBox.xPercent,
        y: customBox.yPercent,
        width: customBox.widthPercent,
        height: customBox.heightPercent,
        positionLabel: WATERMARK_PRESETS.find((p) => p.id === selectedPresetId)?.name || '自定义区域',
      },
    };

    setOfficeJobs((prev) => [newJob, ...prev]);
    setActiveSubTab('queue');

    // Simulate Bull Queue processing asynchronously
    setTimeout(async () => {
      // Step 1: Processing
      setOfficeJobs((prev) =>
        prev.map((j) => (j.id === jobId ? { ...j, status: 'processing', progress: 45 } : j))
      );

      try {
        const cleanedPdfBytes = await maskPdfWatermark(currentFile.bytes!, customBox);
        const blob = new Blob([cleanedPdfBytes], { type: 'application/pdf' });
        const resultUrl = URL.createObjectURL(blob);
        const downloadName = currentFile.name.replace(/\.pdf$/i, '_已去水印遮盖.pdf');

        setTimeout(() => {
          setOfficeJobs((prev) =>
            prev.map((j) =>
              j.id === jobId
                ? {
                    ...j,
                    status: 'completed',
                    progress: 100,
                    resultUrl,
                    resultBlob: blob,
                    downloadName,
                    completedAt: new Date().toLocaleTimeString(),
                  }
                : j
            )
          );

          addNotification({
            title: 'PDF 去水印处理完成',
            content: `文件「${currentFile.name}」已通过白色矩形遮盖法成功去除指定区域水印，可前往下载。`,
            type: 'office',
          });
        }, 1200);
      } catch (err) {
        console.error(err);
        setOfficeJobs((prev) =>
          prev.map((j) => (j.id === jobId ? { ...j, status: 'failed', progress: 0 } : j))
        );
      }
    }, 800);
  };

  // 2. Submit Convert Format Task (转 Word / XML / HTML)
  const handleSubmitConvert = async (chosenFormat?: 'docx' | 'xml' | 'html', isManualWord = false) => {
    if (!currentFile) return;
    const format = chosenFormat || targetFormat;

    const jobId = `job_${Date.now()}`;
    const newJob: OfficeJob = {
      id: jobId,
      fileName: currentFile.name,
      fileSize: currentFile.size,
      action: isManualWord ? 'convert_word_manual' : 'convert',
      targetFormat: format,
      status: 'queued',
      progress: 0,
      createdAt: new Date().toLocaleTimeString(),
    };

    setOfficeJobs((prev) => [newJob, ...prev]);
    setActiveSubTab('queue');

    setTimeout(async () => {
      setOfficeJobs((prev) =>
        prev.map((j) => (j.id === jobId ? { ...j, status: 'processing', progress: 50 } : j))
      );

      try {
        const { blob, downloadName } = await convertPdfToFormat(currentFile.name, format);
        const resultUrl = URL.createObjectURL(blob);

        setTimeout(() => {
          setOfficeJobs((prev) =>
            prev.map((j) =>
              j.id === jobId
                ? {
                    ...j,
                    status: 'completed',
                    progress: 100,
                    resultUrl,
                    resultBlob: blob,
                    downloadName,
                    completedAt: new Date().toLocaleTimeString(),
                  }
                : j
            )
          );

          addNotification({
            title: `PDF 转 ${format.toUpperCase()} 完成`,
            content: `文件「${currentFile.name}」已成功转换为 ${format.toUpperCase()}，可直接在办公软件中打开与编辑。`,
            type: 'office',
          });
        }, 1000);
      } catch (err) {
        console.error(err);
        setOfficeJobs((prev) =>
          prev.map((j) => (j.id === jobId ? { ...j, status: 'failed', progress: 0 } : j))
        );
      }
    }, 700);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 sm:p-5 shadow-xs">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <FileText className="w-5 h-5 text-blue-600" />
              <span>办公助手（PDF转换与去水印）</span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              支持扫描全能王水印精准遮盖、转Word手工处理及XML/HTML高保真格式转换
            </p>
          </div>

          {/* Sub tabs */}
          <div className="flex items-center bg-slate-100 p-1 rounded-lg border border-slate-200 text-xs">
            <button
              onClick={() => setActiveSubTab('watermark')}
              className={`px-3 py-1.5 rounded-md font-medium transition-colors ${
                activeSubTab === 'watermark'
                  ? 'bg-white text-blue-700 shadow-2xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              PDF 去水印
            </button>
            <button
              onClick={() => setActiveSubTab('convert')}
              className={`px-3 py-1.5 rounded-md font-medium transition-colors ${
                activeSubTab === 'convert'
                  ? 'bg-white text-blue-700 shadow-2xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              格式转换 (Word/XML)
            </button>
            <button
              onClick={() => setActiveSubTab('queue')}
              className={`relative px-3 py-1.5 rounded-md font-medium transition-colors ${
                activeSubTab === 'queue'
                  ? 'bg-white text-blue-700 shadow-2xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              任务队列
              {officeJobs.filter((j) => j.status === 'processing' || j.status === 'queued').length > 0 && (
                <span className="ml-1.5 w-2 h-2 rounded-full bg-blue-600 inline-block animate-ping"></span>
              )}
            </button>
          </div>
        </div>

        {/* Global File Upload Banner */}
        <div className="mt-4 pt-4 border-t border-slate-100">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-3 bg-slate-50 rounded-lg border border-dashed border-slate-300">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center shrink-0">
                <FileType className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                {currentFile ? (
                  <>
                    <p className="text-xs font-bold text-slate-800 truncate max-w-sm sm:max-w-md">
                      {currentFile.name}
                    </p>
                    <p className="text-[10px] text-slate-500 mt-0.5">
                      大小：{(currentFile.size / 1024).toFixed(1)} KB · 格式验证已通过
                    </p>
                  </>
                ) : (
                  <>
                    <p className="text-xs font-semibold text-slate-700">尚未选择 PDF 文档</p>
                    <p className="text-[10px] text-slate-400">支持拖拽、本地上传或一键加载测试示例</p>
                  </>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <label className="cursor-pointer px-3 py-1.5 text-xs font-medium text-slate-700 bg-white hover:bg-slate-50 border border-slate-300 rounded-lg shadow-2xs transition-colors flex items-center gap-1.5">
                <Upload className="w-3.5 h-3.5" />
                <span>选择本地 PDF</span>
                <input
                  id="input-office-pdf-upload"
                  type="file"
                  accept="application/pdf"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>

              <button
                id="btn-load-sample-pdf"
                onClick={handleLoadSamplePdf}
                className="px-3 py-1.5 text-xs font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-lg border border-blue-200 transition-colors flex items-center gap-1.5"
                title="加载系统内置带扫描全能王水印的测试PDF"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>使用示例PDF</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Sub-Tab 1: PDF 去水印 */}
      {activeSubTab === 'watermark' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Method 1: 遮盖法 */}
          <div className="lg:col-span-7 bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-md bg-blue-100 text-blue-700 font-bold text-xs flex items-center justify-center">
                  1
                </span>
                <div>
                  <h3 className="text-sm font-bold text-slate-800">方式一：区域遮盖法 (覆盖白色矩形)</h3>
                  <p className="text-[11px] text-slate-500">
                    使用 pdf-lib 在指定坐标覆写纯白图层，保持原有文字矢量排版不变
                  </p>
                </div>
              </div>
            </div>

            {/* Presets */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-2">选择常用预设位置：</label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {WATERMARK_PRESETS.map((p) => {
                  const isSelected = selectedPresetId === p.id;
                  return (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => handlePresetSelect(p.id)}
                      className={`p-3 text-left rounded-lg border transition-all text-xs ${
                        isSelected
                          ? 'border-blue-500 bg-blue-50/50 ring-2 ring-blue-500/20'
                          : 'border-slate-200 hover:border-slate-300 bg-white'
                      }`}
                    >
                      <p className={`font-bold ${isSelected ? 'text-blue-700' : 'text-slate-800'}`}>{p.name}</p>
                      <p className="text-[10px] text-slate-500 mt-1 line-clamp-2">{p.description}</p>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Visual Preview Box */}
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-slate-700">页面覆盖坐标微调 (百分比)：</span>
                <span className="text-[11px] text-slate-400 font-mono">
                  X:{customBox.xPercent}% Y:{customBox.yPercent}% W:{customBox.widthPercent}% H:{customBox.heightPercent}%
                </span>
              </div>

              {/* Simulated Page Box */}
              <div className="relative w-full h-44 bg-white rounded-lg border-2 border-slate-300 overflow-hidden shadow-inner flex flex-col justify-between p-3">
                <div className="space-y-1 opacity-30">
                  <div className="w-1/3 h-2 bg-slate-400 rounded-sm"></div>
                  <div className="w-5/6 h-1.5 bg-slate-300 rounded-sm"></div>
                  <div className="w-4/6 h-1.5 bg-slate-300 rounded-sm"></div>
                </div>

                <div className="space-y-1 opacity-30">
                  <div className="w-full h-1.5 bg-slate-300 rounded-sm"></div>
                  <div className="w-3/4 h-1.5 bg-slate-300 rounded-sm"></div>
                </div>

                {/* Target Watermark Overlay Masking Rect */}
                <div
                  className="absolute border-2 border-dashed border-red-500 bg-red-500/20 rounded flex items-center justify-center text-[10px] font-bold text-red-700 transition-all duration-300"
                  style={{
                    left: `${customBox.xPercent}%`,
                    bottom: `${customBox.yPercent}%`,
                    width: `${customBox.widthPercent}%`,
                    height: `${customBox.heightPercent * 2}%`, // visual scaling
                  }}
                >
                  覆写白块
                </div>
              </div>

              {/* Coordinate Sliders */}
              <div className="grid grid-cols-2 gap-3 mt-3">
                <div>
                  <label className="text-[10px] font-medium text-slate-500">水平位置 X: {customBox.xPercent}%</label>
                  <input
                    type="range"
                    min="0"
                    max="90"
                    value={customBox.xPercent}
                    onChange={(e) =>
                      setCustomBox({ ...customBox, xPercent: parseFloat(e.target.value) })
                    }
                    className="w-full"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-medium text-slate-500">垂直距底 Y: {customBox.yPercent}%</label>
                  <input
                    type="range"
                    min="0"
                    max="90"
                    value={customBox.yPercent}
                    onChange={(e) =>
                      setCustomBox({ ...customBox, yPercent: parseFloat(e.target.value) })
                    }
                    className="w-full"
                  />
                </div>
              </div>
            </div>

            <button
              id="btn-apply-watermark-mask"
              disabled={!currentFile}
              onClick={handleSubmitWatermarkMask}
              className={`w-full py-2.5 px-4 rounded-lg text-xs font-semibold text-white transition-all shadow-xs flex items-center justify-center gap-2 ${
                currentFile
                  ? 'bg-blue-600 hover:bg-blue-700 cursor-pointer'
                  : 'bg-slate-300 cursor-not-allowed'
              }`}
            >
              <Layers className="w-4 h-4" />
              <span>开始执行遮盖去水印 (生成无水印PDF)</span>
            </button>
          </div>

          {/* Method 2: 转 Word 手工处理 */}
          <div className="lg:col-span-5 bg-white rounded-xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between space-y-4">
            <div>
              <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
                <span className="w-6 h-6 rounded-md bg-emerald-100 text-emerald-700 font-bold text-xs flex items-center justify-center">
                  2
                </span>
                <div>
                  <h3 className="text-sm font-bold text-slate-800">方式二：转 Word 后手工处理</h3>
                  <p className="text-[11px] text-slate-500">导出为可编辑文档，手动删除水印图层</p>
                </div>
              </div>

              <div className="mt-4 space-y-3 text-xs text-slate-600 leading-relaxed">
                <div className="p-3 bg-amber-50 rounded-lg border border-amber-200 text-amber-800">
                  <p className="font-semibold flex items-center gap-1 text-[11px]">
                    <ShieldAlert className="w-3.5 h-3.5 text-amber-600" />
                    <span>复杂背景或大面积水印推荐途径</span>
                  </p>
                  <p className="mt-1 text-[11px] leading-relaxed">
                    若扫描王水印穿插在文字背景后方，遮盖法可能遮挡背景底纹。转为 Word 后可在 WPS 或 Office
                    中直接选中“页脚图片”或“背景水印”一键按 Delete 键删除，再另存为 PDF。
                  </p>
                </div>

                <div className="space-y-1.5 pl-2">
                  <p className="font-semibold text-slate-800">标准操作流程：</p>
                  <ol className="list-decimal list-inside space-y-1 text-slate-500">
                    <li>点击下方按钮将当前 PDF 转换为可编辑 DOCX。</li>
                    <li>在 Word / WPS 中双击页眉页脚或背景图层。</li>
                    <li>选中「扫描全能王」文字或图片，直接删除。</li>
                    <li>点击「另存为」重新导出为清洁的 PDF 文件。</li>
                  </ol>
                </div>
              </div>
            </div>

            <button
              id="btn-convert-word-manual"
              disabled={!currentFile}
              onClick={() => handleSubmitConvert('docx', true)}
              className={`w-full py-2.5 px-4 rounded-lg text-xs font-semibold text-white transition-all shadow-xs flex items-center justify-center gap-2 ${
                currentFile
                  ? 'bg-emerald-600 hover:bg-emerald-700 cursor-pointer'
                  : 'bg-slate-300 cursor-not-allowed'
              }`}
            >
              <FileCheck className="w-4 h-4" />
              <span>转为 Word (.docx) 手工处理水印</span>
            </button>
          </div>
        </div>
      )}

      {/* Sub-Tab 2: PDF 格式转换 */}
      {activeSubTab === 'convert' && (
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs max-w-2xl mx-auto space-y-5">
          <div>
            <h3 className="text-base font-bold text-slate-900">PDF 格式高保真转换</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              支持将 PDF 文档转换为结构化 Word、XML 数据流或标准网页 HTML
            </p>
          </div>

          <div className="space-y-3">
            <label className="block text-xs font-semibold text-slate-700">选择目标输出格式：</label>
            <div className="grid grid-cols-3 gap-3">
              <button
                type="button"
                onClick={() => setTargetFormat('docx')}
                className={`p-3.5 rounded-xl border text-center transition-all ${
                  targetFormat === 'docx'
                    ? 'border-blue-500 bg-blue-50/50 ring-2 ring-blue-500/20 text-blue-700'
                    : 'border-slate-200 hover:border-slate-300 text-slate-700'
                }`}
              >
                <FileText className="w-6 h-6 mx-auto mb-1 text-blue-600" />
                <p className="text-xs font-bold">Word (.docx)</p>
                <p className="text-[10px] text-slate-400 mt-0.5">可二次编辑排版</p>
              </button>

              <button
                type="button"
                onClick={() => setTargetFormat('xml')}
                className={`p-3.5 rounded-xl border text-center transition-all ${
                  targetFormat === 'xml'
                    ? 'border-blue-500 bg-blue-50/50 ring-2 ring-blue-500/20 text-blue-700'
                    : 'border-slate-200 hover:border-slate-300 text-slate-700'
                }`}
              >
                <FileCode className="w-6 h-6 mx-auto mb-1 text-amber-600" />
                <p className="text-xs font-bold">XML 结构化</p>
                <p className="text-[10px] text-slate-400 mt-0.5">用于系统间数据交换</p>
              </button>

              <button
                type="button"
                onClick={() => setTargetFormat('html')}
                className={`p-3.5 rounded-xl border text-center transition-all ${
                  targetFormat === 'html'
                    ? 'border-blue-500 bg-blue-50/50 ring-2 ring-blue-500/20 text-blue-700'
                    : 'border-slate-200 hover:border-slate-300 text-slate-700'
                }`}
              >
                <Layers className="w-6 h-6 mx-auto mb-1 text-indigo-600" />
                <p className="text-xs font-bold">HTML 网页</p>
                <p className="text-[10px] text-slate-400 mt-0.5">跨平台免插件浏览</p>
              </button>
            </div>
          </div>

          <div className="p-3.5 bg-slate-50 rounded-lg text-xs text-slate-600 border border-slate-200">
            <p className="font-semibold text-slate-800">转换说明：</p>
            <p className="mt-0.5 text-slate-500 leading-relaxed">
              底层调用轻量转换引擎，提取文档标题、段落排版与层级结构。转换过程在后台队列中以毫秒级异步执行，完成后将在消息中心发出提示。
            </p>
          </div>

          <button
            id="btn-submit-convert-job"
            disabled={!currentFile}
            onClick={() => handleSubmitConvert()}
            className={`w-full py-2.5 px-4 rounded-lg text-xs font-semibold text-white transition-all shadow-xs flex items-center justify-center gap-2 ${
              currentFile
                ? 'bg-blue-600 hover:bg-blue-700 cursor-pointer'
                : 'bg-slate-300 cursor-not-allowed'
            }`}
          >
            <RefreshCw className="w-4 h-4" />
            <span>加入队列并开始转换</span>
          </button>
        </div>
      )}

      {/* Sub-Tab 3: 异步任务队列 (Bull Queue) */}
      {activeSubTab === 'queue' && (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
          <div className="px-5 py-3.5 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-blue-600" />
              <h3 className="font-semibold text-slate-800 text-sm">
                办公助手异步队列 (Bull 任务中心)
              </h3>
            </div>
            <span className="text-xs text-slate-400">支持多任务并行处理与即时下载</span>
          </div>

          {officeJobs.length === 0 ? (
            <div className="p-12 text-center text-slate-400">
              <FolderOpen className="w-10 h-10 mx-auto mb-2 text-slate-300" />
              <p className="text-xs font-medium text-slate-600">队列当前为空</p>
              <p className="text-[11px] text-slate-400 mt-1">
                提交 PDF 去水印或格式转换任务后，将在此实时查看执行进度
              </p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {officeJobs.map((job) => {
                const isCompleted = job.status === 'completed';
                const isProcessing = job.status === 'processing';
                const isQueued = job.status === 'queued';

                return (
                  <div key={job.id} className="p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 hover:bg-slate-50/60 transition-colors">
                    <div className="space-y-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-800 truncate max-w-sm">
                          {job.fileName}
                        </span>
                        <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-100 text-slate-600">
                          {job.action === 'watermark_mask'
                            ? 'PDF 遮盖去水印'
                            : job.action === 'convert_word_manual'
                            ? '转 Word 手工去水印'
                            : `转 ${job.targetFormat?.toUpperCase()}`}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400">
                        提交时间：{job.createdAt} {job.completedAt && `· 完成于：${job.completedAt}`}
                      </p>
                    </div>

                    <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
                      {/* Status indicator */}
                      <div>
                        {isQueued && (
                          <span className="inline-flex items-center gap-1 text-xs font-medium text-slate-500">
                            <Clock className="w-3.5 h-3.5" />
                            排队中...
                          </span>
                        )}
                        {isProcessing && (
                          <span className="inline-flex items-center gap-1.5 text-xs font-medium text-blue-600">
                            <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                            处理中 ({job.progress}%)
                          </span>
                        )}
                        {isCompleted && (
                          <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-600">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            处理成功
                          </span>
                        )}
                      </div>

                      {/* Download button */}
                      {isCompleted && job.resultUrl && (
                        <a
                          id={`btn-download-job-${job.id}`}
                          href={job.resultUrl}
                          download={job.downloadName || 'processed_document'}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 shadow-xs transition-colors"
                        >
                          <Download className="w-3.5 h-3.5" />
                          <span>立即下载</span>
                        </a>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
