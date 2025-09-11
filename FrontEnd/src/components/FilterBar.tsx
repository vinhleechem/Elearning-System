import {
  FilterList,
  QuestionMarkOutlined,
  CodeOutlined,
  EditOutlined,
  GroupOutlined,
} from "@mui/icons-material";
import Button from "./common/Button";
import Menu from "./common/Menu";
import { relatedFilter } from "../libs/constants";

export default function FilterBar() {
  return (
    <div className="flex items-center justify-between">
      <div className="flex gap-2">
        <Button
          variant="outlined"
          icon={<FilterList className="mr-1" />}
          sx={{
            borderRadius: "50px",
            textTransform: "none",
            borderColor: "#ccc",
            color: "#000",
            "&:hover": {
              borderColor: "808080",
            },
            paddingX: 2,
            paddingY: 0.5,
          }}
        >
          Tất cả bộ lọc
        </Button>
        <Button
          variant="outlined"
          icon={<QuestionMarkOutlined fontSize="small" className="mr-1" />}
          sx={{
            borderRadius: "50px",
            textTransform: "none",
            borderColor: "#ccc",
            color: "#000",
            "&:hover": {
              borderColor: "808080",
            },
            paddingX: 2,
            paddingY: 0.5,
          }}
        >
          Trắc nghiệm
        </Button>
        <Button
          variant="outlined"
          icon={<CodeOutlined className="mr-1" />}
          sx={{
            borderRadius: "50px",
            textTransform: "none",
            borderColor: "#ccc",
            color: "#000",
            "&:hover": {
              borderColor: "808080",
            },
            paddingX: 2,
            paddingY: 0.5,
          }}
        >
          Bài tập coding
        </Button>
        <Button
          variant="outlined"
          icon={<EditOutlined className="mr-1" />}
          sx={{
            borderRadius: "50px",
            textTransform: "none",
            borderColor: "#ccc",
            color: "#000",
            "&:hover": {
              borderColor: "808080",
            },
            paddingX: 2,
            paddingY: 0.5,
          }}
        >
          Bài kiểm tra thực hành
        </Button>
        <Button
          variant="outlined"
          icon={<GroupOutlined className="mr-1" />}
          sx={{
            borderRadius: "50px",
            textTransform: "none",
            borderColor: "#ccc",
            color: "#000",
            "&:hover": {
              borderColor: "808080",
            },
            paddingX: 2,
            paddingY: 0.5,
          }}
        >
          Học tập nhập vai
        </Button>
        <Button
          variant="outlined"
          sx={{
            borderRadius: "50px",
            textTransform: "none",
            borderColor: "#ccc",
            color: "#000",
            "&:hover": {
              borderColor: "808080",
            },
            paddingX: 2,
            paddingY: 0.5,
          }}
        >
          Ngôn ngữ
        </Button>
        <Button
          variant="outlined"
          sx={{
            borderRadius: "50px",
            textTransform: "none",
            borderColor: "#ccc",
            color: "#000",
            "&:hover": {
              borderColor: "808080",
            },
            paddingX: 2,
            paddingY: 0.5,
          }}
        >
          Xếp hạng
        </Button>
      </div>
      <div>
        <Menu
          hasArrow={true}
          buttonLabel="Liên quan nhất"
          items={relatedFilter}
        />
      </div>
    </div>
  );
}
