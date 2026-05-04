function LoadingScreen() {
  return (
    <div style={{
      position:       "fixed",
      inset:          0,
      background:     "#1a1a2e",
      display:        "flex",
      flexDirection:  "column",
      alignItems:     "center",
      justifyContent: "center",
      gap:            "24px",
      zIndex:         9999,
    }}>
      <div style={{
        fontFamily: "'Playfair Display', serif",
        fontSize:   "32px",
        color:      "#c9a84c",
        fontWeight: 700,
      }}>
        📚 The Grand Library
      </div>

      <div style={{
        width:        "48px",
        height:       "48px",
        border:       "3px solid rgba(201,168,76,0.2)",
        borderTop:    "3px solid #c9a84c",
        borderRadius: "50%",
        animation:    "spin 0.8s linear infinite",
      }} />

      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>

      <p style={{
        color:       "#555",
        fontSize:    "13px",
        letterSpacing: "2px",
        textTransform: "uppercase",
      }}>
        Opening the doors...
      </p>
    </div>
  )
}

export default LoadingScreen