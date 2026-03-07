import useReadingStore from "../../store/readingStore";

export default function ReadingControls() {
  const { increaseFont, decreaseFont, toggleReader } = useReadingStore();

  return (
    <div className="flex gap-3 border rounded p-2 w-fit">
      <button onClick={increaseFont}>A+</button>
      <button onClick={decreaseFont}>A-</button>
      <button onClick={toggleReader}>Reader Mode</button>
    </div>
  );
}
