const StarPicker = ({ value = 0, onChange }) => {
  return (
    <div className="star-picker" aria-label="Select rating">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          className={star <= Number(value) ? "active" : ""}
          onClick={() => onChange(star)}
          aria-label={`${star} star${star === 1 ? "" : "s"}`}
        >
          ★
        </button>
      ))}
    </div>
  );
};

export default StarPicker;
