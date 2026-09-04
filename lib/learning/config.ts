import rawConfig from "../../learning-engine.config.v0.1.json";
import type { MasteryConfig, RecommendationConfig } from "./types";

export const masteryConfig: MasteryConfig = rawConfig.mastery;
export const recommendationConfig: RecommendationConfig = rawConfig.recommendation;
