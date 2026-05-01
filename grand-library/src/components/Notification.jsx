import { useEffect, useState } from 'react'

function Notification({ message }) {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    /* Fade out after 2.6s so it disappears at 3s */
    const timer = setTimeout(() => setVisible(false), 2600);
    return () => clearTimeout(timer);
  }, [message]);

  return (
    <div className={`notification ${!visible ? "notification-hide" : ""}`}>
      {message}
    </div>
  );
}

export default Notification