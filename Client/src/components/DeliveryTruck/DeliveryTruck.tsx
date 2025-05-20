import './DeliveryTruck.css';

export function DeliveryTruck() {
  return (
    <div className="truck-container">
      <div className="truck">
        <div className="truck-body">
          <div className="cabin"></div>
          <div className="cargo"></div>
          <div className="wheel front-wheel"></div>
          <div className="wheel back-wheel"></div>
        </div>
      </div>
    </div>
  );
}