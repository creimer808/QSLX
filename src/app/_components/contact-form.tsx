"use client";

import { useState, useEffect } from "react";
import { api } from "~/trpc/react";
import { Plus, X } from "lucide-react";

export function ContactForm() {
  const [isOpen, setIsOpen] = useState(false);
  const utils = api.useUtils();
  const createContact = api.contact.create.useMutation({
    onSuccess: () => {
      void utils.contact.getAll.invalidate();
      void utils.contact.getStats.invalidate();
      void utils.contact.getMapData.invalidate();
      setIsOpen(false);
      resetForm();
    },
  });

  const [formData, setFormData] = useState({
    callsign: "",
    date: "",
    frequency: "",
    mode: "",
    band: "",
    signalType: "",
    pathType: "",
    rstSent: "",
    rstReceived: "",
    gridSquare: "",
    latitude: "",
    longitude: "",
    country: "",
    state: "",
    notes: "",
  });

  // Set date after component mounts to avoid hydration mismatch
  useEffect(() => {
    setFormData((prev) => ({
      ...prev,
      date: new Date().toISOString().split("T")[0] ?? "",
    }));
  }, []);

  const resetForm = () => {
    setFormData({
      callsign: "",
      date: new Date().toISOString().split("T")[0] ?? "",
      frequency: "",
      mode: "",
      band: "",
      signalType: "",
      pathType: "",
      rstSent: "",
      rstReceived: "",
      gridSquare: "",
      latitude: "",
      longitude: "",
      country: "",
      state: "",
      notes: "",
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createContact.mutate({
      callsign: formData.callsign,
      date: new Date(formData.date),
      frequency: formData.frequency ? parseFloat(formData.frequency) : undefined,
      mode: formData.mode || undefined,
      band: formData.band || undefined,
      signalType: formData.signalType || undefined,
      pathType: formData.pathType || undefined,
      rstSent: formData.rstSent || undefined,
      rstReceived: formData.rstReceived || undefined,
      gridSquare: formData.gridSquare || undefined,
      latitude: formData.latitude ? parseFloat(formData.latitude) : undefined,
      longitude: formData.longitude ? parseFloat(formData.longitude) : undefined,
      country: formData.country || undefined,
      state: formData.state || undefined,
      notes: formData.notes || undefined,
    });
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
      >
        <Plus className="h-5 w-5" />
        Log Contact
      </button>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="relative w-full max-w-2xl rounded-lg bg-white p-6 shadow-xl">
        <button
          onClick={() => {
            setIsOpen(false);
            resetForm();
          }}
          className="absolute right-4 top-4 text-gray-500 hover:text-gray-700"
        >
          <X className="h-6 w-6" />
        </button>

        <h2 className="mb-4 text-2xl font-bold text-gray-900">Log New Contact</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Callsign *
              </label>
              <input
                type="text"
                required
                value={formData.callsign}
                onChange={(e) =>
                  setFormData({ ...formData, callsign: e.target.value.toUpperCase() })
                }
                className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2"
                placeholder="W1ABC"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Date *
              </label>
              <input
                type="date"
                required
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Frequency (MHz)
              </label>
              <input
                type="number"
                step="0.001"
                value={formData.frequency}
                onChange={(e) =>
                  setFormData({ ...formData, frequency: e.target.value })
                }
                className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2"
                placeholder="14.200"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Band</label>
              <select
                value={formData.band}
                onChange={(e) => setFormData({ ...formData, band: e.target.value })}
                className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2"
              >
                <option value="">Select band</option>
                <option value="160m">160m</option>
                <option value="80m">80m</option>
                <option value="40m">40m</option>
                <option value="20m">20m</option>
                <option value="15m">15m</option>
                <option value="10m">10m</option>
                <option value="6m">6m</option>
                <option value="2m">2m</option>
                <option value="70cm">70cm</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Mode</label>
              <select
                value={formData.mode}
                onChange={(e) => setFormData({ ...formData, mode: e.target.value })}
                className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2"
              >
                <option value="">Select mode</option>
                <option value="SSB">SSB</option>
                <option value="CW">CW</option>
                <option value="FT8">FT8</option>
                <option value="FT4">FT4</option>
                <option value="PSK31">PSK31</option>
                <option value="RTTY">RTTY</option>
                <option value="SSTV">SSTV</option>
                <option value="AM">AM</option>
                <option value="FM">FM</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Signal Type</label>
              <select
                value={formData.signalType}
                onChange={(e) => setFormData({ ...formData, signalType: e.target.value })}
                className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2"
              >
                <option value="">Select signal type</option>
                <option value="DMR">DMR</option>
                <option value="Analog">Analog</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Path Type</label>
              <select
                value={formData.pathType}
                onChange={(e) => setFormData({ ...formData, pathType: e.target.value })}
                className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2"
              >
                <option value="">Select path type</option>
                <option value="Repeater">Repeater</option>
                <option value="Digital Hotspot">Digital Hotspot</option>
                <option value="Simplex">Simplex</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                RST Sent
              </label>
              <input
                type="text"
                value={formData.rstSent}
                onChange={(e) => setFormData({ ...formData, rstSent: e.target.value })}
                className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2"
                placeholder="599"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                RST Received
              </label>
              <input
                type="text"
                value={formData.rstReceived}
                onChange={(e) =>
                  setFormData({ ...formData, rstReceived: e.target.value })
                }
                className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2"
                placeholder="599"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Grid Square
              </label>
              <input
                type="text"
                value={formData.gridSquare}
                onChange={(e) =>
                  setFormData({ ...formData, gridSquare: e.target.value.toUpperCase() })
                }
                className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2"
                placeholder="FN20"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Latitude
              </label>
              <input
                type="number"
                step="0.0001"
                value={formData.latitude}
                onChange={(e) =>
                  setFormData({ ...formData, latitude: e.target.value })
                }
                className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2"
                placeholder="40.7128"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Longitude
              </label>
              <input
                type="number"
                step="0.0001"
                value={formData.longitude}
                onChange={(e) =>
                  setFormData({ ...formData, longitude: e.target.value })
                }
                className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2"
                placeholder="-74.0060"
              />
            </div>

            <div>
            <label className="block text-sm font-medium text-gray-700">Country</label>
              <select
                value={formData.country}
                onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2"
              >
                <option value="">Select country</option>
                <option value="United States">United States</option>
                <option value="Canada">Canada</option>
                <option value="United Kingdom">United Kingdom</option>
                <option value="Australia">Australia</option>
                <option value="Germany">Germany</option>
                <option value="France">France</option>
                <option value="Italy">Italy</option>
                <option value="Spain">Spain</option>
                <option value="Netherlands">Netherlands</option>
                <option value="Belgium">Belgium</option>
                <option value="Switzerland">Switzerland</option>
                <option value="Austria">Austria</option>
                <option value="Sweden">Sweden</option>
                <option value="Norway">Norway</option>
                <option value="Denmark">Denmark</option>
                <option value="Finland">Finland</option>
                <option value="Poland">Poland</option>
                <option value="Czech Republic">Czech Republic</option>
                <option value="Portugal">Portugal</option>
                <option value="Greece">Greece</option>
                <option value="Japan">Japan</option>
                <option value="South Korea">South Korea</option>
                <option value="China">China</option>
                <option value="India">India</option>
                <option value="Brazil">Brazil</option>
                <option value="Argentina">Argentina</option>
                <option value="Mexico">Mexico</option>
                <option value="South Africa">South Africa</option>
                <option value="New Zealand">New Zealand</option>
                <option value="Russia">Russia</option>
                <option value="Ukraine">Ukraine</option>
                <option value="Turkey">Turkey</option>
                <option value="Israel">Israel</option>
                <option value="Thailand">Thailand</option>
                <option value="Philippines">Philippines</option>
                <option value="Indonesia">Indonesia</option>
                <option value="Malaysia">Malaysia</option>
                <option value="Singapore">Singapore</option>
                <option value="Taiwan">Taiwan</option>
                <option value="Hong Kong">Hong Kong</option>
                <option value="Chile">Chile</option>
                <option value="Peru">Peru</option>
                <option value="Colombia">Colombia</option>
                <option value="Venezuela">Venezuela</option>
                <option value="Ecuador">Ecuador</option>
                <option value="Uruguay">Uruguay</option>
                <option value="Paraguay">Paraguay</option>
                <option value="Bolivia">Bolivia</option>
                <option value="Costa Rica">Costa Rica</option>
                <option value="Panama">Panama</option>
                <option value="Guatemala">Guatemala</option>
                <option value="Honduras">Honduras</option>
                <option value="El Salvador">El Salvador</option>
                <option value="Nicaragua">Nicaragua</option>
                <option value="Cuba">Cuba</option>
                <option value="Jamaica">Jamaica</option>
                <option value="Dominican Republic">Dominican Republic</option>
                <option value="Puerto Rico">Puerto Rico</option>
                <option value="Trinidad and Tobago">Trinidad and Tobago</option>
                <option value="Iceland">Iceland</option>
                <option value="Ireland">Ireland</option>
                <option value="Luxembourg">Luxembourg</option>
                <option value="Monaco">Monaco</option>
                <option value="Liechtenstein">Liechtenstein</option>
                <option value="Malta">Malta</option>
                <option value="Cyprus">Cyprus</option>
                <option value="Romania">Romania</option>
                <option value="Bulgaria">Bulgaria</option>
                <option value="Hungary">Hungary</option>
                <option value="Slovakia">Slovakia</option>
                <option value="Slovenia">Slovenia</option>
                <option value="Croatia">Croatia</option>
                <option value="Serbia">Serbia</option>
                <option value="Bosnia and Herzegovina">Bosnia and Herzegovina</option>
                <option value="Albania">Albania</option>
                <option value="Macedonia">Macedonia</option>
                <option value="Montenegro">Montenegro</option>
                <option value="Estonia">Estonia</option>
                <option value="Latvia">Latvia</option>
                <option value="Lithuania">Lithuania</option>
                <option value="Belarus">Belarus</option>
                <option value="Moldova">Moldova</option>
                <option value="Egypt">Egypt</option>
                <option value="Morocco">Morocco</option>
                <option value="Algeria">Algeria</option>
                <option value="Tunisia">Tunisia</option>
                <option value="Libya">Libya</option>
                <option value="Sudan">Sudan</option>
                <option value="Ethiopia">Ethiopia</option>
                <option value="Kenya">Kenya</option>
                <option value="Tanzania">Tanzania</option>
                <option value="Uganda">Uganda</option>
                <option value="Ghana">Ghana</option>
                <option value="Nigeria">Nigeria</option>
                <option value="Senegal">Senegal</option>
                <option value="Ivory Coast">Ivory Coast</option>
                <option value="Cameroon">Cameroon</option>
                <option value="Gabon">Gabon</option>
                <option value="Congo">Congo</option>
                <option value="Democratic Republic of the Congo">Democratic Republic of the Congo</option>
                <option value="Angola">Angola</option>
                <option value="Zambia">Zambia</option>
                <option value="Zimbabwe">Zimbabwe</option>
                <option value="Botswana">Botswana</option>
                <option value="Namibia">Namibia</option>
                <option value="Mozambique">Mozambique</option>
                <option value="Madagascar">Madagascar</option>
                <option value="Mauritius">Mauritius</option>
                <option value="Seychelles">Seychelles</option>
                <option value="Saudi Arabia">Saudi Arabia</option>
                <option value="United Arab Emirates">United Arab Emirates</option>
                <option value="Qatar">Qatar</option>
                <option value="Kuwait">Kuwait</option>
                <option value="Bahrain">Bahrain</option>
                <option value="Oman">Oman</option>
                <option value="Yemen">Yemen</option>
                <option value="Iraq">Iraq</option>
                <option value="Iran">Iran</option>
                <option value="Afghanistan">Afghanistan</option>
                <option value="Pakistan">Pakistan</option>
                <option value="Bangladesh">Bangladesh</option>
                <option value="Sri Lanka">Sri Lanka</option>
                <option value="Nepal">Nepal</option>
                <option value="Bhutan">Bhutan</option>
                <option value="Myanmar">Myanmar</option>
                <option value="Vietnam">Vietnam</option>
                <option value="Cambodia">Cambodia</option>
                <option value="Laos">Laos</option>
                <option value="Mongolia">Mongolia</option>
                <option value="Kazakhstan">Kazakhstan</option>
                <option value="Uzbekistan">Uzbekistan</option>
                <option value="Kyrgyzstan">Kyrgyzstan</option>
                <option value="Tajikistan">Tajikistan</option>
                <option value="Turkmenistan">Turkmenistan</option>
                <option value="Azerbaijan">Azerbaijan</option>
                <option value="Armenia">Armenia</option>
                <option value="Georgia">Georgia</option>
                <option value="Lebanon">Lebanon</option>
                <option value="Syria">Syria</option>
                <option value="Jordan">Jordan</option>
                <option value="Palestine">Palestine</option>
                <option value="Iraq">Iraq</option>
                <option value="Kazakhstan">Kazakhstan</option>
                <option value="Uzbekistan">Uzbekistan</option>
                <option value="Kyrgyzstan">Kyrgyzstan</option>
                <option value="Tajikistan">Tajikistan</option>
                <option value="Turkmenistan">Turkmenistan</option>
                <option value="Azerbaijan">Azerbaijan</option>
                <option value="Armenia">Armenia</option>
                <option value="Georgia">Georgia</option>
                <option value="Lebanon">Lebanon</option>
                <option value="Syria">Syria</option>
                <option value="Jordan">Jordan</option>
                <option value="Palestine">Palestine</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">State</label>
              <input
                type="text"
                value={formData.state}
                onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2"
                placeholder="NY"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Notes</label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2"
              rows={3}
              placeholder="Additional notes..."
            />
          </div>

          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => {
                setIsOpen(false);
                resetForm();
              }}
              className="rounded-md border border-gray-300 px-4 py-2 text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={createContact.isPending}
              className="rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:opacity-50"
            >
              {createContact.isPending ? "Saving..." : "Save Contact"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

