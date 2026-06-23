/**
 * Settings 页纯逻辑（可独立测试，不依赖 React）。
 */

/**
 * 把"当前模型"与某 provider 的可选模型列表对齐：
 * - 列表非空且当前值不在其中（典型：切了 provider 但仍是上一个/默认的跨厂商模型名）→ 取第一个有效模型。
 * - 列表非空且当前值有效 → 保持。
 * - 列表为空（自定义/文本输入 provider）→ 原样保留（含 undefined）。
 */
export function pickModelId(
  current: string | undefined,
  options: { modelId: string }[],
): string | undefined {
  const first = options[0];
  if (!first) return current;
  if (current && options.some((o) => o.modelId === current)) return current;
  return first.modelId;
}
