import React from "react";
import { Typography, Button } from "antd";
import { useNavigate } from "react-router-dom";

const LandingPage = () => {
    const navigate = useNavigate();

    return (
        <div>
            <Typography.Title>MyEmpathy</Typography.Title>
            <Typography.Paragraph>
                Emotional intelligence tool for analyzing and improving your messages.
            </Typography.Paragraph>
            <Button type="primary" onClick={() => navigate("/analyze")}>
                Try it now
            </Button>
        </div>
    );
};

export default LandingPage;