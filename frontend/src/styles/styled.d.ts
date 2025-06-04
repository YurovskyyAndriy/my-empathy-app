import 'styled-components';
import { type GlobalToken } from 'antd/es/theme';

declare module 'styled-components' {
  export interface DefaultTheme extends GlobalToken {
    headerHeight: number;
    contentMaxWidth: number;
    contentMaxWidthLarge: number;
    contentPadding: number;
    contentGap: number;
    contentGapLarge: number;
  }
} 