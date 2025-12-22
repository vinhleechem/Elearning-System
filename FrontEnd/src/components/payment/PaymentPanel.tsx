import { useState, useEffect } from "react";
import axios from "axios";

export type PaymentMethod = "momo" | "vnpay" | "vietqr" | "payos";

const paymentMethods = [
  {
    id: "momo",
    label: "Momo",
    logo: "https://event.mediacdn.vn/thumb_w/1000/257767050295742464/image/cca/2023/9/17/momo-16949607838381240407833.jpg",
  },
  {
    id: "vnpay",
    label: "VNPay",
    logo: "https://yt3.googleusercontent.com/JM1m2wng0JQUgSg9ZSEvz7G4Rwo7pYb4QBYip4PAhvGRyf1D_YTbL2DdDjOy0qOXssJPdz2r7Q=s900-c-k-c0x00ffffff-no-rj",
  },
  {
    id: "payos",
    label: "PayOS",
    logo: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRKOCs8yde-EAOZYYVAQ1Ztqt5yidi_ilpp_Q&s",
  },
  {
    id: "vietqr",
    label: "Viet Qr",
    logo: "https://play-lh.googleusercontent.com/22cJzF0otG-EmmQgILMRTWFPnx0wTCSDY9aFaAmOhHs30oNHxi63KcGwUwmbR76Msko",
  },
];

interface PaymentPanelProps {
  selected: PaymentMethod;
  onSelect: (method: PaymentMethod) => void;
}

const PaymentPanel = ({ selected, onSelect }: PaymentPanelProps) => {
  const [countries, setCountries] = useState<any[]>([]);

  useEffect(() => {
    const fetchCountries = async () => {
      try {
        const response = await axios.get("https://restcountries.com/v3.1/all?fields=name,flags");
        const sortedCountries = response.data.sort((a: any, b: any) =>
          a.name.common.localeCompare(b.name.common)
        );
        setCountries(sortedCountries);
      } catch (error) {
        console.error("Failed to fetch countries", error);
      }
    };
    fetchCountries();
  }, []);

  return (
    <div className="flex-[2] rounded-lg">
      <h1 className="mb-4 text-xl font-bold">Thanh toán</h1>
      <div className="mb-6">
        <label className="block py-2 text-lg font-bold text-gray-700">
          Địa chỉ thanh toán
        </label>
        <p className="block py-1 text-lg font-bold text-gray-700">Quốc gia</p>
        <select className="mt-1 block w-full rounded border p-2">
          <option value="Vietnam">Vietnam</option>
          {countries.map((country) => (
            <option key={country.name.common} value={country.name.common}>
              {country.name.common}
            </option>
          ))}
        </select>
      </div>

      {/* Phương thức thanh toán */}
      <div>
        <div className="mb-2 flex items-center justify-between">
          <h2 className="text-lg font-bold text-gray-700">
            Phương thức thanh toán
          </h2>
          <div className="flex items-center gap-1 text-gray-500">
            <span className="text-sm">An toàn và được mã hóa</span>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="h-4 w-4"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z"
              />
            </svg>
          </div>
        </div>
        <div className="space-y-3">
          {paymentMethods.map((method) => (
            <label
              key={method.id}
              className={`flex cursor-pointer items-center gap-3 rounded-lg border p-3 transition ${selected === method.id
                ? "border-blue-500 bg-blue-50"
                : "border-gray-300 hover:border-gray-400"
                }`}
            >
              <input
                type="radio"
                name="payment"
                value={method.id}
                checked={selected === method.id}
                onChange={() => onSelect(method.id as PaymentMethod)}
              />
              <img
                src={method.logo}
                alt={method.label}
                className="h-8 w-8 object-contain"
              />
              <div>
                <p className="font-semibold">{method.label}</p>
              </div>
            </label>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PaymentPanel;
