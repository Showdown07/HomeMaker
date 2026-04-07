import { useEffect, useMemo, useState } from "react";

const initialState = {
  city: "Bengaluru",
  pincode: "",
  category: "",
  lat: "12.9716",
  lng: "77.5946",
};

const presetLocations = [
  {
    label: "Central Bengaluru",
    city: "Bengaluru",
    lat: 12.9716,
    lng: 77.5946,
  },
  {
    label: "Indiranagar",
    city: "Bengaluru",
    lat: 12.9784,
    lng: 77.6408,
  },
  {
    label: "Koramangala",
    city: "Bengaluru",
    lat: 12.9352,
    lng: 77.6245,
  },
  {
    label: "Whitefield",
    city: "Bengaluru",
    lat: 12.9698,
    lng: 77.75,
  },
];

const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

const ServiceFilters = ({ onSearch }) => {
  const [filters, setFilters] = useState(initialState);
  const [geoMessage, setGeoMessage] = useState("Using your selected search zone");
  const [placeLabel, setPlaceLabel] = useState("Central Bengaluru");
  const [mapReady, setMapReady] = useState(false);

  const mapEmbedUrl = useMemo(() => {
    const lat = Number(filters.lat) || 12.9716;
    const lng = Number(filters.lng) || 77.5946;
    const deltaLat = 0.04;
    const deltaLng = 0.04;
    const bbox = [
      lng - deltaLng,
      lat - deltaLat,
      lng + deltaLng,
      lat + deltaLat,
    ].join("%2C");

    return `https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik&marker=${lat}%2C${lng}`;
  }, [filters.lat, filters.lng]);

  useEffect(() => {
    const controller = new AbortController();

    const loadPlace = async () => {
      try {
        setMapReady(false);
        const response = await fetch(
          `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${filters.lat}&lon=${filters.lng}`,
          {
            signal: controller.signal,
            headers: {
              Accept: "application/json",
            },
          }
        );

        if (!response.ok) {
          throw new Error("Unable to fetch location details");
        }

        const data = await response.json();
        const address = data.address || {};
        const resolvedCity =
          address.city ||
          address.town ||
          address.suburb ||
          address.county ||
          filters.city;

        setFilters((current) => ({
          ...current,
          city: resolvedCity || current.city,
        }));
        setPlaceLabel(
          data.name ||
            address.neighbourhood ||
            address.suburb ||
            address.city ||
            "Selected area"
        );
      } catch {
        setPlaceLabel("Selected area");
      } finally {
        setMapReady(true);
      }
    };

    loadPlace();

    return () => controller.abort();
  }, [filters.lat, filters.lng]);

  const handleChange = (event) => {
    setFilters((current) => ({
      ...current,
      [event.target.name]: event.target.value,
    }));
  };

  const applyCoordinates = ({ city, lat, lng }) => {
    setFilters((current) => ({
      ...current,
      city: city || current.city,
      lat: lat.toFixed(4),
      lng: lng.toFixed(4),
    }));
  };

  const handlePresetPick = (preset) => {
    applyCoordinates(preset);
    setGeoMessage(`Pinned to ${preset.label}`);
  };

  const handleLocateMe = () => {
    if (!navigator.geolocation) {
      setGeoMessage("Browser geolocation is not supported on this device.");
      return;
    }

    setGeoMessage("Locating you...");
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;
        applyCoordinates({ city: filters.city, lat, lng });
        setGeoMessage("Using your current device location");
      },
      () => {
        setGeoMessage("Location access was denied. You can still use the map or presets.");
      },
      { enableHighAccuracy: true, timeout: 8000 }
    );
  };

  const handleMapPick = (event) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const relativeX = clamp((event.clientX - rect.left) / rect.width, 0, 1);
    const relativeY = clamp((event.clientY - rect.top) / rect.height, 0, 1);

    const lng = 77.45 + relativeX * (77.8 - 77.45);
    const lat = 13.1 - relativeY * (13.1 - 12.85);

    applyCoordinates({ city: filters.city, lat, lng });
    setGeoMessage("Custom search zone selected from the map");
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    onSearch(filters);
  };

  return (
    <form className="filter-stack" onSubmit={handleSubmit}>
      <section className="geo-panel">
        <div className="geo-panel-copy">
          <span className="eyebrow dark">Geo search</span>
          <h3>Pick an area, not coordinates.</h3>
          <p className="muted-text">
            Use your device location, tap a neighborhood preset, or click the map to set the
            service discovery zone.
          </p>
          <div className="preset-row">
            {presetLocations.map((preset) => (
              <button
                key={preset.label}
                type="button"
                className="ghost-button"
                onClick={() => handlePresetPick(preset)}
              >
                {preset.label}
              </button>
            ))}
          </div>
          <div className="geo-actions">
            <button type="button" className="primary-button" onClick={handleLocateMe}>
              Use My Location
            </button>
            <span className="muted-text">{geoMessage}</span>
          </div>
        </div>

        <div className="geo-map-shell">
          <button type="button" className="geo-map-overlay" onClick={handleMapPick}>
            Tap to refine location
          </button>
          <iframe
            className="geo-map-frame"
            title="Service area map"
            src={mapEmbedUrl}
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />
          <div className="geo-coordinates">
            <strong>{placeLabel}</strong>
            <span>{mapReady ? filters.city : "Loading place details..."}</span>
            <span>
              {filters.lat}, {filters.lng}
            </span>
          </div>
        </div>
      </section>

      <section className="filter-bar filter-panel">
        <label className="field-shell">
          <span>City</span>
          <input name="city" placeholder="City" value={filters.city} onChange={handleChange} />
        </label>
        <label className="field-shell">
          <span>Pincode</span>
          <input
            name="pincode"
            placeholder="Pincode"
            value={filters.pincode}
            onChange={handleChange}
          />
        </label>
        <label className="field-shell">
          <span>Category</span>
          <select name="category" value={filters.category} onChange={handleChange}>
            <option value="">All Categories</option>
            <option value="cleaning">Cleaning</option>
            <option value="cooking">Cooking</option>
            <option value="electrician">Electrician</option>
            <option value="plumber">Plumber</option>
            <option value="painting">Painting</option>
            <option value="appliance repair">Appliance Repair</option>
          </select>
        </label>
        <label className="field-shell">
          <span>Latitude</span>
          <input name="lat" placeholder="Latitude" value={filters.lat} onChange={handleChange} />
        </label>
        <label className="field-shell">
          <span>Longitude</span>
          <input name="lng" placeholder="Longitude" value={filters.lng} onChange={handleChange} />
        </label>
        <button className="primary-button tall-button" type="submit">
          Search
        </button>
      </section>
    </form>
  );
};

export default ServiceFilters;
