export function CommandCentrePreview() {
  return (
    <div className="mk-preview" aria-label="Executive Command Centre preview">
      <div className="mk-preview-bar">
        <span>Command Centre</span>
        <span>Before first meeting</span>
      </div>
      <div className="mk-preview-pulse">
        <div className="mk-preview-row">
          <strong>Overnight change</strong>
          <span>
            What moved against your outcomes while you were offline — ranked for
            judgement.
          </span>
        </div>
        <div className="mk-preview-row">
          <strong>Priority decisions</strong>
          <span>
            Stakes, trade-offs, and unknowns prepared. Authority stays with you.
          </span>
        </div>
        <div className="mk-preview-row">
          <strong>Council ready</strong>
          <span>
            Role-consistent perspectives — Operations, Commercial, or
            Manufacturing context.
          </span>
        </div>
      </div>
    </div>
  );
}
