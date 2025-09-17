import { Link } from "react-router-dom";
import { trendingData } from "../libs/constants";
import {
  ArrowForwardIosOutlined,
  TrendingUpOutlined,
} from "@mui/icons-material";

const Trending = () => {
  return (
    <div>
      <p className="mb-2 text-2xl font-semibold">Đang thịnh hành</p>
      <hr className="mb-6 border-gray-300" />

      <div className="grid grid-cols-1 gap-6 md:grid-cols-4">
        {trendingData.map((col, i) => (
          <div key={i} className="space-y-4">
            <h1 className="text-3xl font-semibold">{col.title}</h1>

            {col.items.map((item) => (
              <div key={item.name}>
                <Link
                  to="/"
                  className="flex items-center text-xl font-semibold text-purple-700 hover:underline"
                >
                  {item.name}
                  <ArrowForwardIosOutlined sx={{ fontSize: 14, ml: 0.5 }} />
                </Link>
                <p className="text-sm text-gray-500">
                  {item.students.toLocaleString("vi-VN")} học viên
                </p>
              </div>
            ))}

            {col.button && (
              <Link
                to="/tat-ca-ky-nang"
                className="inline-block rounded border border-purple-500 px-3 py-1 text-xs text-purple-700 hover:bg-purple-50"
              >
                {col.button}
                <TrendingUpOutlined className="ml-0.5" fontSize="small" />
              </Link>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Trending;
