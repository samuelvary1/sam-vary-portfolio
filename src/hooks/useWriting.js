import { useEffect, useState } from "react";

const useWriting = () => {
  const [writings, setWritings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadWritings = async () => {
      try {
        const res = await fetch("/data/writing/metadata.json");
        const metadata = await res.json();

        const loaded = await Promise.all(
          metadata.map(async (entry) => {
            const textRes = await fetch(`/data/writing/${entry.slug}.txt`);
            const content = await textRes.text();
            return {
              ...entry,
              content,
            };
          }),
        );

        setWritings(loaded);
      } catch (err) {
        console.error("Error loading writing:", err);
        setWritings([]);
      } finally {
        setLoading(false);
      }
    };

    loadWritings();
  }, []);

  return { writings, loading };
};

export default useWriting;
