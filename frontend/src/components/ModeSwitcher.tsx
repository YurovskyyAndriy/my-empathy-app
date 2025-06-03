import { Select } from "antd";

type Props = {
    mode: "edit" | "analyze";
    onChange: (mode: "edit" | "analyze") => void;
};

const ModeSwitcher = ({ mode, onChange }: Props) => {
    return (
        <Select
            value={mode}
            onChange={onChange}
            style={{ width: 300 }}
            options={[
                { value: "edit", label: "Edit emotionally" },
                { value: "analyze", label: "Full analysis + result" },
            ]}
        />
    );
};

export default ModeSwitcher;
