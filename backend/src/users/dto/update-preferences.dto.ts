import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsIn, IsOptional } from 'class-validator';
import { COLOR_MODES, THEMES } from '../../common/types/enums';
import type { ColorMode, Theme } from '../../common/types/enums';

export class UpdatePreferencesDto {
  @ApiPropertyOptional({ enum: THEMES })
  @IsOptional()
  @IsIn(THEMES)
  theme?: Theme;

  @ApiPropertyOptional({ enum: COLOR_MODES })
  @IsOptional()
  @IsIn(COLOR_MODES)
  colorMode?: ColorMode;
}
