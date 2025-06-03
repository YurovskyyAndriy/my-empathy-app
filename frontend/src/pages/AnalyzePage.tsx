import React, { useState } from "react";
import { Typography, Select, Space, message } from "antd";
import MessageForm from "../components/MessageForm";
import ModeSwitcher from "../components/ModeSwitcher";

const AnalyzePage = () => {
    const [mode, setMode] = useState<"edit" | "analyze">("edit");

    return (
        <Space direction="vertical" style={{ width: "100%" }}>
            <Typography.Title level={2}>Analyze your message</Typography.Title>
            <ModeSwitcher mode={mode} onChange={setMode} />
            <MessageForm mode={mode} />
        </Space>
    );
};

export default AnalyzePage;