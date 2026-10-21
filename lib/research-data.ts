/** Transcribed from the author-supplied revised paper PDF (version 4).
 * Author order follows the paper. The presentation is a private reference only.
 */
export const RESEARCH = {
  title: "What Transfers from Text to Vision?",
  subtitle: "Capability Scaling Laws and Transfer Dynamics for VLMs",
  arxiv: "https://arxiv.org/abs/2608.00013",
  code: "https://github.com/wangq-dev/CDMScaling",
  authors: [
    { name: "Ziran Li", affiliation: "1", equal: true },
    { name: "Qiang Wang", affiliation: "2", equal: true },
    { name: "Zhengyu Chen", affiliation: "1", equal: false },
    { name: "Shanglin Lei", affiliation: "1", equal: false },
    { name: "Borun Chen", affiliation: "1", equal: false },
    { name: "Jingang Wang", affiliation: "1", equal: false },
    { name: "Xunliang Cai", affiliation: "1", equal: false },
  ],
  // Figure 4; leave-one-family-out accuracy MAE in percentage points.
  familyErrors: [
    { family: "Qwen3", mae: 2.169 },
    { family: "DeepSeek", mae: 1.809 },
    { family: "Falcon3", mae: 2.225 },
    { family: "Gemma-2", mae: 1.524 },
  ],
  // Table 3: absorption coefficients are shown here in their original units.
  familyProfiles: [
    { family: "Llama", transfer: 0.361, decay: 0.0455, absorption: 0.0122 },
    { family: "Gemma-2", transfer: 0.324, decay: 0.0451, absorption: 0.0213 },
    { family: "Falcon3", transfer: 0.288, decay: 0.0133, absorption: 0.0117 },
    { family: "Qwen3", transfer: 0.246, decay: 0.0219, absorption: 0.0126 },
  ],
  // Table 7, selected main-fit lambda coefficients. These are associations.
  benchmarks: [
    { name: "dyck_languages_hard", value: 0.119 },
    { name: "hindu_knowledge", value: 0.108 },
    { name: "mmlu_stem", value: 0.057 },
    { name: "matrixshapes", value: 0.049 },
    { name: "boolean_expressions_hard", value: -0.078 },
    { name: "contextual_param_knowledge_conflicts", value: -0.048 },
    { name: "entailed_polarity", value: -0.037 },
    { name: "multirc", value: -0.035 },
  ],
  bibtex: `@misc{li2026transferstextvision,
  title={What Transfers from Text to Vision? Capability Scaling Laws and Transfer Dynamics for VLMs},
  author={Ziran Li and Qiang Wang and Zhengyu Chen and Shanglin Lei and Borun Chen and Jingang Wang and Xunliang Cai},
  year={2026},
  eprint={2608.00013},
  archivePrefix={arXiv},
  primaryClass={cs.CL},
  url={https://arxiv.org/abs/2608.00013}
}`,
} as const;
