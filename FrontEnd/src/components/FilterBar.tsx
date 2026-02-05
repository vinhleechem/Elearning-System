import {
  FilterList,
  QuestionMarkOutlined,
  CodeOutlined,
  EditOutlined,
  GroupOutlined,
} from "@mui/icons-material";
import Button from "./ui/Button";
import Menu from "./ui/Menu";
import { relatedFilter } from "../libs/constants";
import { BUTTON_STYLES } from "../constants";

export default function FilterBar() {
  return (
    <div className="flex items-center justify-between">
      <div className="flex gap-2">
        <Button
          variant="outlined"
          icon={<FilterList className="mr-1" />}
          sx={{
            ...BUTTON_STYLES.pill,
            ...BUTTON_STYLES.outlined,
          }}
        >
          Tất cả bộ lọc
        </Button>
        <Button
          variant="outlined"
          icon={<QuestionMarkOutlined fontSize="small" className="mr-1" />}
          sx={{
            ...BUTTON_STYLES.pill,
            ...BUTTON_STYLES.outlined,
          }}
        >
          Trắc nghiệm
        </Button>
        <Button
          variant="outlined"
          icon={<CodeOutlined className="mr-1" />}
          sx={{
            ...BUTTON_STYLES.pill,
            ...BUTTON_STYLES.outlined,
          }}
        >
          Bài tập coding
        </Button>
        <Button
          variant="outlined"
          icon={<EditOutlined className="mr-1" />}
          sx={{
            ...BUTTON_STYLES.pill,
            ...BUTTON_STYLES.outlined,
          }}
        >
          Bài kiểm tra thực hành
        </Button>
        <Button
          variant="outlined"
          icon={<GroupOutlined className="mr-1" />}
          sx={{
            ...BUTTON_STYLES.pill,
            ...BUTTON_STYLES.outlined,
          }}
        >
          Học tập nhập vai
        </Button>
        <Button
          variant="outlined"
          sx={{
            ...BUTTON_STYLES.pill,
            ...BUTTON_STYLES.outlined,
          }}
        >
          Ngôn ngữ
        </Button>
        <Button
          variant="outlined"
          sx={{
            ...BUTTON_STYLES.pill,
            ...BUTTON_STYLES.outlined,
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
