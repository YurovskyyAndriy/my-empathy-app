import { type FC } from 'react';
import { Radio, type RadioChangeEvent } from 'antd';
import styled from 'styled-components';

interface ModeSwitcherProps {
    mode: 'edit' | 'analyze';
    onChange: (mode: 'edit' | 'analyze') => void;
}

const StyledRadioGroup = styled(Radio.Group)`
    width: 100%;
    max-width: 300px;

    .ant-radio-button-wrapper {
        width: 50%;
        text-align: center;
    }
`;

const ModeSwitcher: FC<ModeSwitcherProps> = ({ mode, onChange }) => {
    return (
        <StyledRadioGroup
            value={mode}
            onChange={(e: RadioChangeEvent) => onChange(e.target.value as 'edit' | 'analyze')}
            optionType="button"
            buttonStyle="solid"
            options={[
                { label: 'Edit Mode', value: 'edit' },
                { label: 'Analyze Mode', value: 'analyze' },
            ]}
        />
    );
};

export default ModeSwitcher;
