import { useRef, useState } from 'react';
import { ImagePlus, Loader, Trash2 } from 'lucide-react';
import { useEditorStore } from '@/store/editorStore';
import { useUiStore } from '@/store/uiStore';
import { formatBytes } from '@/services/publishing';

export function AssetsPanel({ onPick }: { onPick?: (assetId: string) => void }) {
  const project = useEditorStore((s) => s.project);
  const assetUrls = useEditorStore((s) => s.assetUrls);
  const uploadAsset = useEditorStore((s) => s.uploadAsset);
  const deleteAsset = useEditorStore((s) => s.deleteAsset);
  const toast = useUiStore((s) => s.toast);

  const inputRef = useRef<HTMLInputElement | null>(null);
  const [busy, setBusy] = useState(false);
  const [dragOver, setDragOver] = useState(false);

  async function handleFiles(files: FileList | null) {
    if (!files || files.length === 0) return;
    setBusy(true);
    let added = 0;
    for (const file of Array.from(files)) {
      if (!file.type.startsWith('image/') && !file.type.startsWith('video/')) {
        toast(`"${file.name}" is not an image or video.`, 'error');
        continue;
      }
      try {
        await uploadAsset(file);
        added += 1;
      } catch (error) {
        toast(error instanceof Error ? error.message : 'Upload failed.', 'error');
      }
    }
    setBusy(false);
    if (added) toast(`${added} file${added === 1 ? '' : 's'} uploaded.`, 'success');
  }

  if (!project) return null;

  return (
    <>
      <div className="f-panel-head">
        <h2>Assets</h2>
        <button className="f-btn f-btn-ghost f-btn-sm" onClick={() => inputRef.current?.click()} disabled={busy}>
          {busy ? <Loader size={13} className="f-spin" /> : <ImagePlus size={14} />} Upload
        </button>
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/*,video/*"
        multiple
        hidden
        onChange={(event) => {
          void handleFiles(event.target.files);
          event.target.value = '';
        }}
      />

      <div
        className="f-dropzone"
        data-over={dragOver}
        onClick={() => inputRef.current?.click()}
        onDragOver={(event) => {
          event.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(event) => {
          event.preventDefault();
          setDragOver(false);
          void handleFiles(event.dataTransfer.files);
        }}
      >
        Drop images here, or click to browse
      </div>

      <div className="f-panel-body f-scroll">
        {project.assets.length === 0 ? (
          <div className="f-empty">
            <strong>No images yet</strong>
            <span>Upload photos once and reuse them across every page.</span>
          </div>
        ) : (
          <div className="f-assets">
            {project.assets.map((asset) => (
              <div
                key={asset.id}
                className="f-asset"
                onClick={() => onPick?.(asset.id)}
                title={`${asset.filename} · ${formatBytes(asset.size)}`}
              >
                {assetUrls[asset.id] ? (
                  asset.mimeType.startsWith('video/') ? (
                    <video src={assetUrls[asset.id]} muted />
                  ) : (
                    <img src={assetUrls[asset.id]} alt={asset.filename} />
                  )
                ) : (
                  <div className="f-empty" style={{ padding: 10, fontSize: 11 }}>
                    Missing file
                  </div>
                )}
                <span className="f-asset-name">{asset.filename}</span>
                <button
                  className="f-asset-del"
                  title="Delete asset"
                  onClick={(event) => {
                    event.stopPropagation();
                    void deleteAsset(asset.id);
                  }}
                >
                  <Trash2 size={12} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
