# 可疑项 v0.0.46-nightly.20261010.2935

价值用途与模板误配，默认都不转换。value-use 131 处（66 条文字）、template-collision 67 处（59 条文字）。

## value-use

这些文字也出现在「从不转换」的位置（比较、`switch case`、`as const`、字面量类型、对象键等），默认不转换。人工确认安全后，把精确的文字加进 `dict/allow-suspicious.json`（JSON 字符串数组）即可放行。

### `Commit`（message，14 处）

- 可疑位置：`apps/web/src/components/GitActionsControl.logic.ts:194`（C，buildMenuItems）；`apps/web/src/components/GitActionsControl.logic.ts:241`（C，resolveQuickAction）；`apps/web/src/components/GitActionsControl.logic.ts:246`（C，resolveQuickAction）；`apps/web/src/components/GitActionsControl.logic.ts:264`（C，resolveQuickAction）；`apps/web/src/components/GitActionsControl.logic.ts:273`（C，resolveQuickAction）；`apps/web/src/components/GitActionsControl.logic.ts:297`（C，resolveQuickAction）；`apps/web/src/components/GitActionsControl.logic.ts:364`（C，resolveQuickAction）；`apps/web/src/components/GitActionsControl.logic.ts:381`（C，resolveQuickAction）；`packages/client-runtime/src/state/gitActions.ts:77`（C，buildMenuItems）；`packages/client-runtime/src/state/gitActions.ts:117`（C，resolveQuickAction）；`packages/client-runtime/src/state/gitActions.ts:122`（C，resolveQuickAction）；`packages/client-runtime/src/state/gitActions.ts:138`（C，resolveQuickAction）；`packages/client-runtime/src/state/gitActions.ts:147`（C，resolveQuickAction）；`packages/client-runtime/src/state/gitActions.ts:238`（C，resolveQuickAction）
- 作为值用途字面量出现 1 次：`apps/web/src/components/GitActionsControl.tsx:397`（comparison）

### `Push`（message，9 处）

- 可疑位置：`apps/web/src/components/GitActionsControl.logic.ts:207`（C，buildMenuItems）；`apps/web/src/components/GitActionsControl.logic.ts:304`（C，resolveQuickAction）；`apps/web/src/components/GitActionsControl.logic.ts:312`（C，resolveQuickAction）；`apps/web/src/components/GitActionsControl.logic.ts:346`（C，resolveQuickAction）；`packages/client-runtime/src/state/gitActions.ts:85`（C，buildMenuItems）；`packages/client-runtime/src/state/gitActions.ts:166`（C，resolveQuickAction）；`packages/client-runtime/src/state/gitActions.ts:177`（C，resolveQuickAction）；`packages/client-runtime/src/state/gitActions.ts:185`（C，resolveQuickAction）；`packages/client-runtime/src/state/gitActions.ts:219`（C，resolveQuickAction）
- 作为值用途字面量出现 1 次：`apps/web/src/components/GitActionsControl.tsx:398`（comparison）

### `Agent`（message，5 处）

- 可疑位置：`apps/web/src/components/chat/TraitsPicker.tsx:47`（C，SAVED_OPTION_LABELS）；`apps/web/src/components/settings/DiagnosticsSettings.tsx:255`（C，formatProcessType）；`apps/web/src/components/settings/customModelEditor.logic.ts:112`（C，label）；`packages/provider-opencode/src/server/status.ts:186`（C，DEFAULT_OPENCODE_MODEL_CAPABILITIES）；`packages/provider-opencode/src/server/status.ts:242`（C，openCodeCapabilitiesForModel）
- 作为值用途字面量出现 8 次：`apps/server/src/orchestration-v2/Adapters/ClaudeAdapterV2.ts:6480`（comparison）；`apps/server/src/orchestration-v2/Adapters/ClaudeAdapterV2.ts:7079`（comparison）；`apps/server/src/orchestration-v2/Adapters/ClaudeAdapterV2.ts:7109`（comparison）；`packages/provider-cursor/src/server/CursorAgentSdk.ts:310`（object-key）；`packages/provider-cursor/src/server/CursorSdk.ts:66`（object-key）；`packages/provider-cursor/src/server/CursorSdk.ts:82`（object-key）；`packages/provider-cursor/src/server/sdk.ts:8`（object-key）；`packages/provider-cursor/src/server/textGeneration.ts:61`（object-key）

### `Browser`（message，5 处）

- 可疑位置：`apps/web/src/components/RightPanelTabs.tsx:357`（C，RightPanelEmptyState）；`apps/web/src/components/RightPanelTabs.tsx:625`（C，surfaceTitle）；`apps/web/src/components/RightPanelTabs.tsx:628`（C，surfaceTitle）；`apps/web/src/components/RightPanelTabs.tsx:630`（C，surfaceTitle）；`apps/web/src/components/RightPanelTabs.tsx:939`（C，RightPanelTabs）
- 作为值用途字面量出现 6 次：`apps/server/src/provider/CodexToolPresentation.ts:190`（comparison）；`apps/server/src/resourceTelemetry/Model.ts:104`（switch-case）；`apps/web/src/components/RightPanelTabs.tsx:535`（comparison）；`apps/web/src/components/RightPanelTabs.tsx:547`（comparison）；`apps/web/src/components/RightPanelTabs.tsx:1356`（comparison）；`packages/contracts/src/resourceTelemetry.ts:232`（schema-literal）

### `Mixed`（message，5 处）

- 可疑位置：`apps/web/src/components/settings/ProjectDefaultsSettings.tsx:167`（C，ProjectDefaultsSettings）；`apps/web/src/components/settings/SettingsPanels.tsx:3268`（C，GeneralSettingsPanel）；`apps/web/src/components/settings/SourceControlWritingSettings.tsx:311`（C，SourceControlWritingSettingsSection）；`apps/web/src/components/usage/usagePriceTable.ts:43`（C，usageAliasCell）；`apps/web/src/components/usage/usagePriceTable.ts:58`（C，usagePriceCell）
- 作为值用途字面量出现 1 次：`apps/web/src/components/usage/UsagePriceOverrides.tsx:212`（comparison）

### `Waiting`（message，5 处）

- 可疑位置：`apps/web/src/components/Sidebar.logic.ts:1211`（C，resolveThreadStatusPill）；`apps/web/src/components/Sidebar.tsx:1308`（C，SidebarThreadRow）；`apps/web/src/components/chat/ThreadRelationshipIcon.tsx:19`（C，threadRelationshipStatusLabel）；`apps/web/src/components/chat/V2LifecycleRow.tsx:250`（C，label）；`packages/client-runtime/src/state/threadExecution.ts:192`（C，SUBAGENT_STATUS_LABELS）
- 作为值用途字面量出现 2 次：`apps/web/src/components/Sidebar.logic.ts:633`（ts-type）；`apps/web/src/components/Sidebar.logic.ts:645`（object-key）

### `Completed`（message，4 处）

- 可疑位置：`apps/web/src/components/Sidebar.logic.ts:1234`（C，resolveThreadStatusPill）；`apps/web/src/components/chat/ComposerTasksBadge.tsx:25`（C，taskStatusLabels）；`apps/web/src/components/chat/V2LifecycleRow.tsx:252`（C，label）；`packages/client-runtime/src/state/threadExecution.ts:193`（C，SUBAGENT_STATUS_LABELS）
- 作为值用途字面量出现 3 次：`apps/web/src/components/Sidebar.logic.ts:630`（ts-type）；`apps/web/src/components/Sidebar.logic.ts:647`（object-key）；`packages/client-runtime/src/connection/supervisor.ts:97`（ts-type）

### `Unavailable`（message，4 处）

- 可疑位置：`apps/web/src/components/settings/ResourceTelemetryDiagnostics.tsx:151`（C，ioSemanticsLabel）；`apps/web/src/components/settings/providerStatus.ts:72`（C，getProviderSummary）；`apps/web/src/components/usage/usagePriceTable.ts:41`（C，usageAliasCell）；`apps/web/src/components/usage/usagePriceTable.ts:57`（C，usagePriceCell）
- 作为值用途字面量出现 2 次：`apps/web/src/components/settings/ResourceTelemetryDiagnostics.tsx:1206`（never-attribute）；`apps/web/src/components/usage/UsagePriceOverrides.tsx:213`（comparison）

### `Working`（message，4 处）

- 可疑位置：`apps/web/src/components/Sidebar.logic.ts:1189`（C，resolveThreadStatusPill）；`apps/web/src/components/Sidebar.tsx:1298`（C，SidebarThreadRow）；`packages/client-runtime/src/state/threadExecution.ts:190`（C，SUBAGENT_STATUS_LABELS）；`packages/client-runtime/src/state/threadExecution.ts:191`（C，SUBAGENT_STATUS_LABELS）
- 作为值用途字面量出现 2 次：`apps/web/src/components/Sidebar.logic.ts:628`（ts-type）；`apps/web/src/components/Sidebar.logic.ts:643`（object-key）

### `Antigravity`（message，3 处）

- 可疑位置：`apps/web/src/components/settings/providerDriverMeta.ts:32`（C，providerClients）；`apps/web/src/components/usage/usageProviders.ts:40`（C，label）；`packages/contracts/src/editor.ts:70`（C，label）
- 作为值用途字面量出现 1 次：`packages/shared/src/nodeRuntime.ts:13`（schema-literal）

### `Branch`（message，3 处）

- 可疑位置：`apps/web/src/components/threadActionMenu.logic.ts:55`（C，buildDraftActionMenuItems）；`apps/web/src/components/threadActionMenu.logic.ts:227`（C，buildThreadActionMenuItems）；`packages/client-runtime/src/state/subagentDisplay.ts:108`（C，resolveSubagentMetadata）
- 作为值用途字面量出现 1 次：`apps/web/src/components/chat/SubagentTooltipContent.tsx:174`（comparison）

### `Cursor`（message，3 处）

- 可疑位置：`apps/web/src/components/usage/usageProviders.ts:33`（C，label）；`packages/contracts/src/editor.ts:31`（C，label）；`packages/provider-cursor/src/client.ts:14`（C，cursorClient）
- 作为值用途字面量出现 2 次：`packages/provider-cursor/src/server/sdk.ts:11`（object-key）；`packages/provider-cursor/src/server/status.ts:27`（as-const）

### `Fast`（message，3 处）

- 可疑位置：`apps/web/src/components/chat/TraitsSpeed.tsx:14`（C，getTraitsSpeedDisplay）；`apps/web/src/components/settings/customModelEditor.logic.ts:64`（C，label）；`apps/web/src/components/usage/usageBreakdown.ts:83`（C，speedCostSegments）
- 作为值用途字面量出现 3 次：`apps/web/src/components/chat/TraitsPicker.tsx:512`（comparison）；`apps/web/src/components/chat/TraitsSpeed.tsx:22`（comparison）；`apps/web/src/components/settings/ProviderModelsSection.tsx:51`（comparison）

### `Option`（message，3 处）

- 可疑位置：`packages/contracts/src/settings.ts:207`（C，APPLE_MODIFIER_LABELS）；`packages/provider-opencode/src/server/adapter.ts:1766`（C，requestQuestions）；`packages/provider-opencode/src/server/adapter.ts:1767`（C，requestQuestions）
- 作为值用途字面量出现 1 次：`apps/web/src/shortcutModifierState.ts:87`（switch-case）

### `T3 Code`（message，3 处）

- 可疑位置：`apps/web/src/components/settings/IntegrationsSettings.tsx:580`（C，LINK_TARGET_LABELS）；`apps/web/src/components/settings/ThemePreviewCircles.tsx:61`（C，label）；`packages/provider-muse/src/server/sdk.ts:81`（C，museInitializeParams）
- 作为值用途字面量出现 1 次：`apps/server/src/cloud/cliAuthHtml.ts:12`（as-const）

### `Alt`（message，2 处）

- 可疑位置：`apps/web/src/lib/snapShotShortcut.ts:68`（C，modifierKeyLabel）；`packages/contracts/src/settings.ts:213`（C，OTHER_MODIFIER_LABELS）
- 作为值用途字面量出现 6 次：`apps/desktop/src/preview/RecordingInput.ts:24`（comparison）；`apps/desktop/src/preview/RecordingInput.ts:41`（membership）；`apps/web/src/components/ComposerPromptEditorTiptap.tsx:1767`（comparison）；`apps/web/src/components/settings/useSnapShotShortcutRecorder.tsx:23`（object-key）；`apps/web/src/shortcutModifierState.ts:86`（switch-case）；`packages/contracts/src/previewAutomation.ts:572`（schema-literal）

### `Codex`（message，2 处）

- 可疑位置：`apps/web/src/components/settings/providerDriverMeta.ts:19`（C，providerClients）；`apps/web/src/components/usage/usageProviders.ts:18`（C，label）
- 作为值用途字面量出现 1 次：`apps/server/src/provider/CodexProvider.ts:71`（as-const）

### `Connecting`（message，2 处）

- 可疑位置：`apps/web/src/components/Sidebar.logic.ts:1202`（C，resolveThreadStatusPill）；`packages/contracts/src/projectClone.ts:93`（C，projectCloneStageLabel）
- 作为值用途字面量出现 2 次：`apps/web/src/components/Sidebar.logic.ts:629`（ts-type）；`apps/web/src/components/Sidebar.logic.ts:644`（object-key）

### `New thread`（message，2 处）

- 可疑位置：`apps/web/src/components/ChatView.logic.ts:520`（C，buildLocalDraftThread）；`packages/provider-core/src/server/textGenerationUtils.ts:73`（C，sanitizeThreadTitle）
- 作为值用途字面量出现 1 次：`apps/server/src/orchestration-v2/ThreadTitleRegenerationService.ts:118`（comparison）

### `Nightly`（message，2 处）

- 可疑位置：`apps/web/src/branding.logic.ts:20`（C，resolveServerBackedAppStageLabel）；`apps/web/src/components/SidebarStageBackdrop.tsx:31`（C，resolveEnvironmentIdentificationPillLabel）
- 作为值用途字面量出现 3 次：`apps/web/src/components/SidebarStageBackdrop.tsx:9`（ts-type）；`packages/contracts/src/ipc.ts:84`（ts-type）；`packages/contracts/src/ipc.ts:99`（schema-literal）

### `OpenCode`（message，2 处）

- 可疑位置：`apps/web/src/components/usage/usageProviders.ts:35`（C，label）；`packages/provider-opencode/src/client.ts:14`（C，openCodeClient）
- 作为值用途字面量出现 1 次：`packages/provider-opencode/src/server/status.ts:29`（as-const）

### `Shift`（message，2 处）

- 可疑位置：`packages/contracts/src/settings.ts:204`（C，APPLE_MODIFIER_LABELS）；`packages/contracts/src/settings.ts:210`（C，OTHER_MODIFIER_LABELS）
- 作为值用途字面量出现 6 次：`apps/desktop/src/preview/RecordingInput.ts:25`（comparison）；`apps/desktop/src/preview/RecordingInput.ts:41`（membership）；`apps/web/src/components/ComposerPromptEditorTiptap.tsx:1768`（comparison）；`apps/web/src/components/settings/useSnapShotShortcutRecorder.tsx:19`（object-key）；`apps/web/src/shortcutModifierState.ts:89`（switch-case）；`packages/contracts/src/previewAutomation.ts:572`（schema-literal）

### `Android`（message，1 处）

- 可疑位置：`packages/shared/src/thirdPartyLicenses.ts:100`（C，BUNDLE_LABELS）
- 作为值用途字面量出现 2 次：`apps/server/src/ws.ts:669`（comparison）；`packages/contracts/src/baseSchemas.ts:353`（schema-literal）

### `Awaiting Input`（message，1 处）

- 可疑位置：`apps/web/src/components/Sidebar.logic.ts:1180`（C，resolveThreadStatusPill）
- 作为值用途字面量出现 2 次：`apps/web/src/components/Sidebar.logic.ts:632`（ts-type）；`apps/web/src/components/Sidebar.logic.ts:642`（object-key）

### `C`（message，1 处）

- 可疑位置：`apps/web/src/composer-code-languages.ts:13`（C，label）
- 作为值用途字面量出现 9 次：`apps/web/src/themePalette.ts:350`（object-key）；`apps/web/src/themePalette.ts:379`（object-key）；`apps/web/src/themePalette.ts:514`（object-key）；`apps/web/src/themePalette.ts:517`（object-key）；`apps/web/src/themePalette.ts:534`（object-key）；`apps/web/src/themePalette.ts:553`（object-key）；`apps/web/src/themePalette.ts:693`（object-key）；`apps/web/src/themePalette.ts:702`（object-key）；`apps/web/src/themePalette.ts:713`（object-key）

### `Claude`（message，1 处）

- 可疑位置：`apps/web/src/components/settings/providerDriverMeta.ts:24`（C，providerClients）
- 作为值用途字面量出现 1 次：`apps/server/src/provider/ClaudeProvider.ts:60`（as-const）

### `Command`（message，1 处）

- 可疑位置：`packages/contracts/src/settings.ts:205`（C，APPLE_MODIFIER_LABELS）
- 作为值用途字面量出现 2 次：`apps/web/src/lib/embeddedScripts.ts:244`（switch-case）；`apps/web/src/shortcutModifierState.ts:82`（switch-case）

### `Control`（message，1 处）

- 可疑位置：`packages/contracts/src/settings.ts:206`（C，APPLE_MODIFIER_LABELS）
- 作为值用途字面量出现 6 次：`apps/desktop/src/preview/RecordingInput.ts:23`（comparison）；`apps/desktop/src/preview/RecordingInput.ts:41`（membership）；`apps/web/src/components/ComposerPromptEditorTiptap.tsx:1765`（comparison）；`apps/web/src/components/settings/useSnapShotShortcutRecorder.tsx:22`（object-key）；`apps/web/src/shortcutModifierState.ts:84`（switch-case）；`packages/contracts/src/previewAutomation.ts:572`（schema-literal）

### `Dev`（message，1 处）

- 可疑位置：`apps/web/src/components/SidebarStageBackdrop.tsx:30`（C，resolveEnvironmentIdentificationPillLabel）
- 作为值用途字面量出现 3 次：`apps/web/src/components/SidebarStageBackdrop.tsx:9`（ts-type）；`packages/contracts/src/ipc.ts:84`（ts-type）；`packages/contracts/src/ipc.ts:99`（schema-literal）

### `Dockerfile`（message，1 处）

- 可疑位置：`apps/web/src/composer-code-languages.ts:19`（C，label）
- 作为值用途字面量出现 1 次：`packages/shared/src/markdownLinks.ts:68`（membership）

### `Enter`（message，1 处）

- 可疑位置：`apps/web/src/components/settings/SettingsPanels.tsx:2179`（C，GeneralSettingsPanel）
- 作为值用途字面量出现 59 次：`apps/desktop/src/preview/AnnotationKeyboard.ts:15`（comparison）；`apps/desktop/src/preview/RecordingInput.ts:29`（object-key）；`apps/web/src/browser/ServerBrowserSurface.tsx:700`（comparison）；`apps/web/src/components/BranchPicker.tsx:183`（comparison）；`apps/web/src/components/ChatMarkdown.tsx:1341`（comparison）；`apps/web/src/components/CommandPalette.tsx:3140`（comparison）；`apps/web/src/components/CommandPalette.tsx:3150`（comparison）；`apps/web/src/components/CommandPalette.tsx:3163`（comparison）；`apps/web/src/components/CommandPalette.tsx:3205`（comparison）；`apps/web/src/components/ComposerPromptEditorTiptap.tsx:1262`（comparison）；…（共 59 处）

### `GPU`（message，1 处）

- 可疑位置：`apps/web/src/components/settings/ResourceTelemetryDiagnostics.tsx:125`（C，categoryLabel）
- 作为值用途字面量出现 2 次：`apps/server/src/resourceTelemetry/Model.ts:108`（switch-case）；`packages/contracts/src/resourceTelemetry.ts:237`（schema-literal）

### `Grok`（message，1 处）

- 可疑位置：`packages/provider-grok/src/client.ts:14`（C，grokClient）
- 作为值用途字面量出现 1 次：`packages/provider-grok/src/server/status.ts:51`（as-const）

### `Linux`（message，1 处）

- 可疑位置：`apps/web/src/components/ProviderUpdateLaunchNotification.logic.ts:698`（C，deriveEnvironmentDisplayLabel）
- 作为值用途字面量出现 2 次：`apps/web/src/components/CommandPalette.tsx:3258`（comparison）；`packages/contracts/src/baseSchemas.ts:351`（schema-literal）

### `Mode`（message，1 处）

- 可疑位置：`packages/provider-acp/src/server/sessionConfig.ts:141`（C，acpProviderOptionDescriptors）
- 作为值用途字面量出现 1 次：`packages/shared/src/qrCode.ts:763`（object-key）

### `Muse Code`（message，1 处）

- 可疑位置：`packages/provider-muse/src/client.ts:14`（C，museClient）
- 作为值用途字面量出现 1 次：`packages/provider-muse/src/server/status.ts:24`（as-const）

### `OPENCODE_PASSWORD`（message，1 处）

- 可疑位置：`packages/provider-opencode/src/server/v2/OpenCode2Server.ts:48`（C，generatePassword）
- 作为值用途字面量出现 1 次：`packages/provider-opencode/src/server/v2/OpenCode2Server.ts:61`（object-key）

### `Pending Approval`（message，1 处）

- 可疑位置：`apps/web/src/components/Sidebar.logic.ts:1171`（C，resolveThreadStatusPill）
- 作为值用途字面量出现 2 次：`apps/web/src/components/Sidebar.logic.ts:631`（ts-type）；`apps/web/src/components/Sidebar.logic.ts:641`（object-key）

### `Pi`（message，1 处）

- 可疑位置：`packages/provider-pi/src/client.ts:14`（C，piClient）
- 作为值用途字面量出现 1 次：`packages/provider-pi/src/server/status.ts:62`（as-const）

### `Plan Ready`（message，1 处）

- 可疑位置：`apps/web/src/components/Sidebar.logic.ts:1225`（C，resolveThreadStatusPill）
- 作为值用途字面量出现 2 次：`apps/web/src/components/Sidebar.logic.ts:634`（ts-type）；`apps/web/src/components/Sidebar.logic.ts:646`（object-key）

### `R`（message，1 处）

- 可疑位置：`apps/web/src/composer-code-languages.ts:35`（C，label）
- 作为值用途字面量出现 2 次：`apps/server/src/terminal/Manager.ts:1040`（comparison）；`apps/web/src/components/device/DeviceStreamView.tsx:401`（membership）

### `Running source control action`（message，1 处）

- 可疑位置：`apps/web/src/state/sourceControlActions.ts:256`（C，useGitStackedAction）
- 作为值用途字面量出现 2 次：`apps/web/src/components/GitActionsControl.logic.ts:96`（comparison）；`packages/client-runtime/src/state/vcsAction.ts:463`（non-display-call）

### `Space`（message，1 处）

- 可疑位置：`apps/web/src/keybindings.ts:192`（C，formatShortcutKeyLabel）
- 作为值用途字面量出现 3 次：`apps/desktop/src/preview/RecordingInput.ts:39`（object-key）；`apps/web/src/terminal/ghostty/keyCodes.ts:68`（as-const）；`packages/client-runtime/src/device/stream.ts:293`（object-key）

### `The OpenCode server rejected the server password.`（message，1 处）

- 可疑位置：`packages/provider-opencode/src/server/v2/OpenCode2Server.ts:89`（C，describeInfoFailure）
- 作为值用途字面量出现 1 次：`packages/provider-opencode/src/server/v2/OpenCode2Server.ts:120`（error-constructor）

### `This connection cannot change keyboard shortcuts.`（message，1 处）

- 可疑位置：`apps/web/src/components/projectScriptEditor.tsx:253`（D，submit）
- 作为值用途字面量出现 1 次：`apps/web/src/components/ChatView.tsx:5143`（error-constructor）

### `This connection cannot change threads.`（message，1 处）

- 可疑位置：`apps/web/src/components/ChatView.tsx:9460`（D，onSend）
- 作为值用途字面量出现 3 次：`apps/web/src/hooks/useThreadActionMenu.ts:173`（error-constructor）；`apps/web/src/hooks/useThreadActions.ts:264`（error-constructor）；`apps/web/src/state/sourceControlActions.ts:342`（error-constructor）

### `Tool`（message，1 处）

- 可疑位置：`packages/provider-acp/src/server/adapter.ts:4451`（C，handleSessionUpdate）
- 作为值用途字面量出现 1 次：`packages/provider-acp-registry/src/server/devinAcp.ts:35`（comparison）

### `Version`（message，1 处）

- 可疑位置：`apps/web/src/components/settings/settingsSearch.ts:529`（C，title）
- 作为值用途字面量出现 3 次：`apps/desktop/src/snapShot/LinuxSnapShot.ts:55`（object-key）；`apps/desktop/src/snapShot/LinuxSnapShot.ts:56`（object-key）；`apps/desktop/src/snapShot/NiriSnapShot.ts:45`（object-key）

### `Windows`（message，1 处）

- 可疑位置：`apps/web/src/components/ProviderUpdateLaunchNotification.logic.ts:694`（C，deriveEnvironmentDisplayLabel）
- 作为值用途字面量出现 2 次：`apps/desktop/src/snapShot/NiriSnapShot.ts:44`（object-key）；`packages/contracts/src/baseSchemas.ts:350`（schema-literal）

### `auto`（message，1 处）

- 可疑位置：`packages/provider-acp-registry/src/settings.ts:60`（C，AcpRegistrySettings）
- 作为值用途字面量出现 135 次：`apps/desktop/src/linuxSecretStorage.ts:2`（ts-type）；`apps/desktop/src/linuxSecretStorage.ts:7`（ts-type）；`apps/desktop/src/linuxSecretStorage.ts:48`（comparison）；`apps/server/src/mcp/OrchestratorMcpService.ts:523`（switch-case）；`apps/server/src/orchestration-v2/Adapters/ClaudeAdapterV2.ts:1585`（switch-case）；`apps/server/src/orchestration-v2/Adapters/CodexAdapterV2.ts:683`（switch-case）；`apps/server/src/orchestration-v2/CommandPolicy.ts:123`（ts-type）；`apps/server/src/orchestration-v2/DispatchModeLimit.ts:38`（object-key）；`apps/server/src/orchestration-v2/ThreadManagementService.ts:45`（ts-type）；`apps/server/src/orchestration-v2/ThreadManagementService.ts:614`（comparison）；…（共 135 处）

### `claude`（message，1 处）

- 可疑位置：`packages/contracts/src/settings.ts:663`（C，ClaudeSettings）
- 作为值用途字面量出现 16 次：`apps/server/src/cli/triage.ts:43`（ts-type）；`apps/server/src/cli/triage.ts:146`（schema-literal）；`apps/server/src/observability/Attributes.ts:42`（membership）；`apps/server/src/provider/ClaudeProvider.ts:131`（string-method）；`apps/server/src/provider/ClaudeProvider.ts:134`（string-method）；`apps/server/src/telemetry/Identify.ts:31`（schema-literal）；`apps/server/src/telemetry/Identify.ts:50`（schema-literal）；`apps/server/src/telemetry/Identify.ts:214`（error-constructor）；`apps/server/src/usage/cliproxyApi.ts:223`（comparison）；`apps/server/src/usage/cliproxyApi.ts:319`（comparison）；…（共 16 处）

### `codex`（message，1 处）

- 可疑位置：`packages/contracts/src/settings.ts:604`（C，CodexSettings）
- 作为值用途字面量出现 69 次：`apps/server/src/cli/triage.ts:43`（ts-type）；`apps/server/src/cli/triage.ts:146`（schema-literal）；`apps/server/src/project/AgentSessionImporter.ts:345`（comparison）；`apps/server/src/project/AgentSessionScanner.ts:305`（comparison）；`apps/server/src/project/AgentSessionScanner.ts:337`（comparison）；`apps/server/src/project/AgentSessionScanner.ts:1093`（as-const）；`apps/server/src/provider/CodexChatGptAuth.ts:274`（comparison）；`apps/server/src/provider/CodexManagedHome.ts:16`（comparison）；`apps/server/src/provider/CodexProvider.ts:653`（comparison）；`apps/server/src/provider/ProviderRegistry.ts:226`（comparison）；…（共 69 处）

### `commented`（message，1 处）

- 可疑位置：`apps/web/src/components/pullRequest/pullRequestDetail.logic.ts:676`（C，buildPullRequestTimeline）
- 作为值用途字面量出现 1 次：`packages/source-control-gitcafe/src/server/gitCafePullRequestJson.ts:390`（as-const）

### `devin`（message，1 处）

- 可疑位置：`packages/provider-acp-registry/src/settings.ts:38`（C，AcpRegistrySettings）
- 作为值用途字面量出现 1 次：`packages/provider-acp-registry/src/server/adapter.ts:184`（comparison）

### `false`（message，1 处）

- 可疑位置：`packages/provider-acp/src/server/adapter.ts:5895`（C，questions）
- 作为值用途字面量出现 36 次：`apps/server/src/preview/ServerBrowserStream.ts:76`（comparison）；`apps/server/src/provider/Drivers/ClaudeSkills.ts:61`（switch-case）；`apps/web/src/components/AppSidebarLayout.tsx:311`（never-attribute）；`apps/web/src/components/ChatMarkdown.tsx:632`（never-attribute）；`apps/web/src/components/ChatMarkdown.tsx:715`（never-attribute）；`apps/web/src/components/ChatMarkdown.tsx:776`（never-attribute）；`apps/web/src/components/ChatView.tsx:11319`（never-attribute）；`apps/web/src/components/chat/ChatComposer.tsx:5614`（never-attribute）；`apps/web/src/components/chat/ChatComposer.tsx:6936`（never-attribute）；`apps/web/src/components/chat/ChatComposer.tsx:7584`（never-attribute）；…（共 36 处）

### `grok`（message，1 处）

- 可疑位置：`packages/provider-grok/src/settings.ts:27`（C，GrokSettings）
- 作为值用途字面量出现 6 次：`apps/server/src/usage/usageTestFormats.ts:13`（ts-type）；`apps/server/src/usage/usageTestFormats.ts:16`（object-key）；`apps/web/src/components/settings/customModelEditor.logic.ts:89`（computed-key）；`apps/web/src/components/usage/usageProviders.ts:27`（object-key）；`packages/contracts/src/usage.ts:37`（schema-literal）；`packages/provider-grok/src/server/status.ts:294`（comparison）

### `iOS`（message，1 处）

- 可疑位置：`packages/shared/src/thirdPartyLicenses.ts:104`（C，BUNDLE_LABELS）
- 作为值用途字面量出现 2 次：`apps/server/src/ws.ts:669`（comparison）；`packages/contracts/src/baseSchemas.ts:352`（schema-literal）

### `macOS`（message，1 处）

- 可疑位置：`apps/web/src/components/ProviderUpdateLaunchNotification.logic.ts:696`（C，deriveEnvironmentDisplayLabel）
- 作为值用途字面量出现 1 次：`packages/contracts/src/baseSchemas.ts:349`（schema-literal）

### `muse`（message，1 处）

- 可疑位置：`packages/provider-muse/src/settings.ts:26`（C，MuseSettings）
- 作为值用途字面量出现 1 次：`apps/server/src/provider/providerCompatibility.ts:78`（comparison）

### `notify`（message，1 处）

- 可疑位置：`packages/provider-pi/src/server/adapter.ts:1231`（C，handleExtensionUiRequest）
- 作为值用途字面量出现 21 次：`apps/desktop/src/window/DesktopWindow.ts:669`（object-key）；`apps/desktop/src/window/QuitHold.ts:35`（object-key）；`apps/web/src/components/files/FilePreviewPanel.tsx:901`（object-key）；`apps/web/src/hooks/useLocalStorage.ts:8`（schema-literal）；`apps/web/src/hooks/useLocalStorage.ts:96`（error-constructor）；`packages/effect-acp/src/agent.ts:54`（object-key）；`packages/effect-acp/src/agent.ts:448`（object-key）；`packages/effect-acp/src/client.ts:56`（object-key）；`packages/effect-acp/src/client.ts:1125`（object-key）；`packages/effect-acp/src/protocol.ts:123`（object-key）；…（共 21 处）

### `opencode`（message，1 处）

- 可疑位置：`packages/provider-opencode/src/settings.ts:29`（C，OpenCodeSettings）
- 作为值用途字面量出现 16 次：`apps/server/src/provider/ProviderRegistry.ts:227`（comparison）；`apps/server/src/provider/ProviderRegistry.ts:251`（comparison）；`apps/web/src/components/chat/ModelPickerContent.tsx:98`（comparison）；`apps/web/src/components/chat/ProviderModelPicker.tsx:84`（comparison）；`apps/web/src/components/chat/TraitsPicker.tsx:146`（comparison）；`apps/web/src/components/chat/composerProviderState.tsx:113`（comparison）；`apps/web/src/components/settings/ProviderModelsSection.tsx:30`（computed-key）；`apps/web/src/components/settings/customModelEditor.logic.ts:108`（computed-key）；`apps/web/src/components/usage/usageProviders.ts:34`（object-key）；`apps/web/src/composerDraftStore.ts:1069`（as-const）；…（共 16 处）

### `pi`（message，1 处）

- 可疑位置：`packages/provider-pi/src/settings.ts:27`（C，PiSettings）
- 作为值用途字面量出现 2 次：`apps/web/src/components/settings/ProviderModelsSection.tsx:31`（computed-key）；`apps/web/src/components/settings/customModelEditor.logic.ts:92`（computed-key）

### `placeholder`（message，1 处）

- 可疑位置：`apps/web/src/components/settings/themeInspector.ts:42`（C，placeholder）
- 作为值用途字面量出现 115 次：`apps/server/src/mcp/OrchestratorMcpService.ts:1724`（object-key）；`apps/server/src/orchestration-v2/Orchestrator.ts:7230`（object-key）；`apps/server/src/secrets/SecretRequests.ts:156`（object-key）；`apps/web/src/components/CommandPalette.tsx:3503`（object-key）；`apps/web/src/components/ComposerPromptEditorTiptap.tsx:158`（object-key）；`apps/web/src/components/ComposerPromptEditorTiptap.tsx:822`（object-key）；`apps/web/src/components/Sidebar.drag.ts:218`（string-method）；`apps/web/src/components/device/DeviceToolsPanel.tsx:377`（object-key）；`apps/web/src/components/device/DeviceToolsPanel.tsx:410`（object-key）；`apps/web/src/components/diffs/DiffCommentAnnotation.tsx:24`（object-key）；…（共 115 处）

### `show-link-context-menu`（message，1 处）

- 可疑位置：`apps/web/src/components/chat/externalLinkContextMenu.ts:114`（D，showExternalLinkContextMenu）
- 作为值用途字面量出现 1 次：`apps/web/src/components/chat/externalLinkContextMenu.ts:11`（ts-type）

### `text-primary`（message，1 处）

- 可疑位置：`apps/web/src/components/ui/collapsible-section-header.tsx:9`（C，label）
- 作为值用途字面量出现 7 次：`apps/web/src/components/Sidebar.tsx:771`（non-display-call）；`apps/web/src/components/auth/ConnectAgentSurface.tsx:324`（non-display-call）；`apps/web/src/components/chat/ComposerTasksBadge.tsx:176`（non-display-call）；`apps/web/src/components/chat/MessageCopyButton.tsx:53`（non-display-call）；`apps/web/src/components/preview/PreviewChromeRow.tsx:250`（non-display-call）；`apps/web/src/components/preview/PreviewChromeRow.tsx:303`（non-display-call）；`apps/web/src/components/settings/SettingInheritance.tsx:219`（non-display-call）

### `true`（message，1 处）

- 可疑位置：`packages/provider-acp/src/server/adapter.ts:5894`（C，questions）
- 作为值用途字面量出现 149 次：`apps/desktop/src/snapShot/captureConfigEdit.ts:111`（comparison）；`apps/desktop/src/telemetry/DesktopTelemetryPublisher.ts:132`（comparison）；`apps/desktop/src/telemetry/DesktopTelemetryPublisher.ts:132`（comparison）；`apps/desktop/src/telemetry/DesktopTelemetryPublisher.ts:138`（comparison）；`apps/desktop/src/telemetry/DesktopTelemetryPublisher.ts:144`（comparison）；`apps/server/src/background/BackgroundPolicy.ts:148`（comparison）；`apps/server/src/background/BackgroundPolicy.ts:153`（comparison）；`apps/server/src/background/BackgroundPolicy.ts:154`（comparison）；`apps/server/src/background/BackgroundPolicy.ts:161`（comparison）；`apps/server/src/cloud/CloudLink.ts:1332`（comparison）；…（共 149 处）

## template-collision

这些文字（或带表达式的模板字面量）不在 `messages` 里，却会被某条 `templates` 匹配，运行时会得到半中半英的错误译文。默认不转换。处理办法：给它补一条**精确的 `messages` 词条**（静态文本），或收窄/删除撞上的那条模板。

### `Environment-relative target. Prefer {kind:'environment-port',port:5173} for a dev server in the current environment.`（message，2 处）

- 可疑位置：`packages/contracts/src/previewAutomation.ts:247`（C，PreviewAutomationNavigateInput）；`packages/contracts/src/previewAutomation.ts:251`（C，PreviewAutomationNavigateInput）
- 撞上的模板：`{0} for {1}`
- 运行时错误译文：`a dev server in the current environment. 的 Environment-relative target. Prefer {kind:'environment-port',port:5173}`

### `Exact collaborative browser tab to target, including a tab the user opened (see preview_status tabs). Omit to use this agent session's current tab, or the user's visible tab when this session has none.`（message，2 处）

- 可疑位置：`packages/contracts/src/previewAutomation.ts:67`（C，description）；`packages/contracts/src/previewAutomation.ts:71`（C，description）
- 撞上的模板：`{head} to {base}`
- 运行时错误译文：`Exact collaborative browser tab 到 target, including a tab the user opened (see preview_status tabs). Omit to use this agent session's current tab, or the user's visible tab when this session has none.`

### `JavaScript expression evaluated in the page's main frame, for example document.title or (() => ({href: location.href}))().`（message，2 处）

- 可疑位置：`packages/contracts/src/previewAutomation.ts:620`（C，PreviewAutomationEvaluateInput）；`packages/contracts/src/previewAutomation.ts:626`（C，PreviewAutomationEvaluateInput）
- 撞上的模板：`{0} for {1}`
- 运行时错误译文：`example document.title or (() => ({href: location.href}))(). 的 JavaScript expression evaluated in the page's main frame,`

### `Run on each request to the task's webhook URL. The prompt may use {{body.path}}, {{headers.name}}, {{query.name}}, {{body}} and {{request}} placeholders.`（message，2 处）

- 可疑位置：`packages/contracts/src/scheduledTask.ts:96`（C，ScheduledTaskWebhookSchedule）；`packages/contracts/src/scheduledTask.ts:122`（C，ScheduledTaskUpsertWebhookSchedule）
- 撞上的模板：`{first} and {second}`
- 运行时错误译文：`Run on each request to the task's webhook URL. The prompt may use {{body.path}}, {{headers.name}}, {{query.name}}, {{body}} 和 {{request}} placeholders.`

### `Run when the task's webhook URL receives a request.`（message，2 处）

- 可疑位置：`packages/contracts/src/scheduledTask.ts:89`（C，ScheduledTaskWebhookSchedule）；`packages/contracts/src/scheduledTask.ts:101`（C，ScheduledTaskUpsertWebhookSchedule）
- 撞上的模板：`Run {0}`
- 运行时错误译文：`运行 when the task's webhook URL receives a request.`

### `Summarize the conversation and reduce context usage`（message，2 处）

- 可疑位置：`packages/provider-core/src/server/snapshotProbe.ts:53`（C，description）；`packages/provider-pi/src/server/commands.ts:7`（C，description）
- 撞上的模板：`{0} {1} usage`
- 运行时错误译文：`Summarize the conversation and reduce context 的使用位置`

### `Use locator='aria-ref=<ref>' with a ref from the latest server snapshot (including iframe elements), or a unique Playwright role/text selector. Refs expire on navigation, a new snapshot, or control handoff; refresh the snapshot after a stale-ref error.`（message，2 处）

- 可疑位置：`packages/contracts/src/previewAutomation.ts:377`（C，Locator）；`packages/contracts/src/previewAutomation.ts:393`（C，description）
- 撞上的模板：`{failure} on {environment}`
- 运行时错误译文：`navigation, a new snapshot, or control handoff; refresh the snapshot after a stale-ref error.上的Use locator='aria-ref=<ref>' with a ref from the latest server snapshot (including iframe elements), or a unique Playwright role/text selector. Refs expire`

### `gh`（message，2 处）

- 可疑位置：`apps/web/src/components/settings/GitHubAccountSettings.tsx:89`（A，GitHubAccountSettings）；`apps/web/src/components/settings/GitHubTokenSettings.tsx:73`（A，GitHubTokenSettings）
- 撞上的模板：`{0}h`
- 运行时错误译文：`g 小时`

### `1 for a click, 2 for a double-click, 3 for a triple-click. Defaults to 1.`（message，1 处）

- 可疑位置：`packages/contracts/src/previewAutomation.ts:434`（C，PreviewAutomationClickInput）
- 撞上的模板：`{0} for {1}`
- 运行时错误译文：`a click, 2 for a double-click, 3 for a triple-click. Defaults to 1. 的 1`

### `A secret the user entered through request_secret, used instead of secret. It is consumed by this save.`（message，1 处）

- 可疑位置：`packages/contracts/src/scheduledTask.ts:112`（C，ScheduledTaskUpsertWebhookSchedule）
- 撞上的模板：`{0} {1} is {2}`
- 运行时错误译文：`A secret the user entered through request_secret, used instead of secret. It 的状态为 consumed by this save.`

### `Absolute paths of files on the environment to give the page. An empty list cancels the open file picker.`（message，1 处）

- 可疑位置：`packages/contracts/src/previewAutomation.ts:504`（C，PreviewAutomationUploadInput）
- 撞上的模板：`{failure} on {environment}`
- 运行时错误译文：`the environment to give the page. An empty list cancels the open file picker.上的Absolute paths of files`

### `Action required`（message，1 处）

- 可疑位置：`packages/provider-acp/src/server/adapter.ts:4537`（C，handleSessionUpdate）
- 撞上的模板：`{0}d`
- 运行时错误译文：`Action require 天`

### `Allow all edits this session`（message，1 处）

- 可疑位置：`packages/provider-grok/src/server/acpSupport.ts:148`（C，grokApprovalOptions）
- 撞上的模板：`{count} session`
- 运行时错误译文：`Allow all edits this 个会话`

### `Allow every {0} request this session`（template，1 处）

- 可疑位置：`packages/provider-opencode/src/server/v2/adapter.ts:531`（C，sessionGrantLabel）
- 撞上的模板：`{count} session`
- 运行时错误译文：`Allow every {0} request this 个会话`

### `Allow {0} this session`（template，1 处）

- 可疑位置：`packages/provider-opencode/src/server/v2/adapter.ts:532`（C，sessionGrantLabel）
- 撞上的模板：`{count} session`
- 运行时错误译文：`Allow {0} this 个会话`

### `Answers the page's open file picker, or sets files on a file input when locator/selector is given.`（message，1 处）

- 可疑位置：`packages/contracts/src/previewAutomation.ts:524`（C，PreviewAutomationUploadInput）
- 撞上的模板：`{0} {1} is {2}`
- 运行时错误译文：`Answers the page's open file picker, or sets files on a file input when locator/selector 的状态为 given.`

### `Chooses options in one native <select> element.`（message，1 处）

- 可疑位置：`packages/contracts/src/previewAutomation.ts:474`（C，PreviewAutomationSelectInput）
- 撞上的模板：`{0} in {1}`
- 运行时错误译文：`Chooses options，用时 one native <select> element.`

### `Compaction failed`（message，1 处）

- 可疑位置：`packages/provider-opencode/src/server/v2/adapter.ts:1228`（C，emitCompaction）
- 撞上的模板：`{0} failed`
- 运行时错误译文：`Compaction 项失败`

### `Compaction interrupted`（message，1 处）

- 可疑位置：`packages/provider-opencode/src/server/v2/adapter.ts:1229`（C，emitCompaction）
- 撞上的模板：`{0}d`
- 运行时错误译文：`Compaction interrupte 天`

### `Context compaction failed`（message，1 处）

- 可疑位置：`packages/provider-pi/src/server/adapter.ts:291`（C，compactionTitle）
- 撞上的模板：`{0} failed`
- 运行时错误译文：`Context compaction 项失败`

### `Context compaction stopped`（message，1 处）

- 可疑位置：`packages/provider-pi/src/server/adapter.ts:293`（C，compactionTitle）
- 撞上的模板：`{0}d`
- 运行时错误译文：`Context compaction stoppe 天`

### `Drags one element and drops it onto another.`（message，1 处）

- 可疑位置：`packages/contracts/src/previewAutomation.ts:497`（C，PreviewAutomationDragInput）
- 撞上的模板：`{first} and {second}`
- 运行时错误译文：`Drags one element 和 drops it onto another.`

### `Each request runs the prompt. Use {{body.path}}, {{headers.name}}, {{query.name}}, {{body}} or {{request}} in the prompt; only what it names reaches the agent.`（message，1 处）

- 可疑位置：`apps/web/src/components/settings/ScheduledTasksSettings.tsx:1176`（A，ScheduledTaskEditorDialog）
- 撞上的模板：`{0} in {1}`
- 运行时错误译文：`Each request runs the prompt. Use {{body.path}}, {{headers.name}}, {{query.name}}, {{body}} or {{request}}，用时 the prompt; only what it names reaches the agent.`

### `How long to wait for the user. Default 10 minutes.`（message，1 处）

- 可疑位置：`packages/contracts/src/orchestratorMcp.ts:609`（C，OrchestratorMcpRequestSecretInput）
- 撞上的模板：`{0} for {1}`
- 运行时错误译文：`the user. Default 10 minutes. 的 How long to wait`

### `How the HMAC-SHA256 digest is encoded in the header.`（message，1 处）

- 可疑位置：`packages/contracts/src/scheduledTask.ts:64`（C，description）
- 撞上的模板：`{0} {1} is {2}`
- 运行时错误译文：`How the HMAC-SHA256 digest 的状态为 encoded in the header.`

### `Legacy CSS selector for a <select>. Prefer locator.`（message，1 处）

- 可疑位置：`packages/contracts/src/previewAutomation.ts:456`（C，PreviewAutomationSelectInput）
- 撞上的模板：`{0} for {1}`
- 运行时错误译文：`a <select>. Prefer locator. 的 Legacy CSS selector`

### `Legacy CSS selector for an <input type=file>. Prefer locator.`（message，1 处）

- 可疑位置：`packages/contracts/src/previewAutomation.ts:507`（C，PreviewAutomationUploadInput）
- 撞上的模板：`{0} for {1}`
- 运行时错误译文：`an <input type=file>. Prefer locator. 的 Legacy CSS selector`

### `Mouse button. Defaults to left; right opens the page's context menu.`（message，1 处）

- 可疑位置：`packages/contracts/src/previewAutomation.ts:429`（C，PreviewAutomationClickInput）
- 撞上的模板：`{head} to {base}`
- 运行时错误译文：`Mouse button. Defaults 到 left; right opens the page's context menu.`

### `Moves the mouse over one target. Provide exactly one of locator, selector, or the x/y coordinate pair.`（message，1 处）

- 可疑位置：`packages/contracts/src/previewAutomation.ts:449`（C，PreviewAutomationHoverInput）
- 撞上的模板：`{selected} of {total}`
- 运行时错误译文：`已选 Moves the mouse over one target. Provide exactly one 个，共 locator, selector, or the x/y coordinate pair. 个`

### `OK`（message，1 处）

- 可疑位置：`packages/provider-grok/src/server/xaiAcpExtension.ts:1236`（C，extractXAiAskUserQuestions）
- 撞上的模板：`{0}K`
- 运行时错误译文：`OK`

### `One or two sentences on what it is for and where the user gets or also enters it.`（message，1 处）

- 可疑位置：`packages/contracts/src/orchestratorMcp.ts:602`（C，OrchestratorMcpRequestSecretInput）
- 撞上的模板：`{first} and {second}`
- 运行时错误译文：`One or two sentences on what it is for 和 where the user gets or also enters it.`

### `Only list this project's tasks. Omit for the calling thread's project, or for every project when the caller is not a T3 thread.`（message，1 处）

- 可疑位置：`packages/contracts/src/orchestratorMcp.ts:572`（C，OrchestratorMcpListScheduledTasksInput）
- 撞上的模板：`{0} {1} is {2}`
- 运行时错误译文：`Only list this project's tasks. Omit for the calling thread's project, or for every project when the caller 的状态为 not a T3 thread.`

### `OpenCode did not finish generating in time.`（message，1 处）

- 可疑位置：`packages/provider-opencode/src/server/v2/textGeneration.ts:163`（C，runOnServer）
- 撞上的模板：`{0} in {1}`
- 运行时错误译文：`OpenCode did not finish generating，用时 time.`

### `OpenCode ended the generation in a way this version cannot read.`（message，1 处）

- 可疑位置：`packages/provider-opencode/src/server/v2/textGeneration.ts:72`（C，runOnServer）
- 撞上的模板：`{0} in {1}`
- 运行时错误译文：`OpenCode ended the generation，用时 a way this version cannot read.`

### `Option values or visible labels to select. Pass several for a multiple select, or an empty list to clear it.`（message，1 处）

- 可疑位置：`packages/contracts/src/previewAutomation.ts:463`（C，PreviewAutomationSelectInput）
- 撞上的模板：`{0} for {1}`
- 运行时错误译文：`a multiple select, or an empty list to clear it. 的 Option values or visible labels to select. Pass several`

### `Optional text to submit when accepting a prompt dialog.`（message，1 处）

- 可疑位置：`packages/contracts/src/previewAutomation.ts:162`（C，PreviewAutomationDialogInput）
- 撞上的模板：`{head} to {base}`
- 运行时错误译文：`Optional text 到 submit when accepting a prompt dialog.`

### `Pass it to a tool that accepts a secretRef; it works once, and you never see the value.`（message，1 处）

- 可疑位置：`packages/contracts/src/orchestratorMcp.ts:622`（C，OrchestratorMcpRequestSecretResult）
- 撞上的模板：`{leading}, and {last}`
- 运行时错误译文：`Pass it to a tool that accepts a secretRef; it works once 和 you never see the value.`

### `Project to act on. Omit for the calling thread's project; required when the caller is not a T3 thread.`（message，1 处）

- 可疑位置：`packages/contracts/src/orchestratorMcp.ts:287`（C，OrchestratorMcpProjectTarget）
- 撞上的模板：`{0} {1} is {2}`
- 运行时错误译文：`Project to act on. Omit for the calling thread's project; required when the caller 的状态为 not a T3 thread.`

### `Public URL to give the sender. Absent when this environment has no T3 Connect managed tunnel; the user must enable T3 Connect remote access first.`（message，1 处）

- 可疑位置：`packages/contracts/src/orchestratorMcp.ts:557`（C，OrchestratorMcpScheduledTask）
- 撞上的模板：`{head} to {base}`
- 运行时错误译文：`Public URL 到 give the sender. Absent when this environment has no T3 Connect managed tunnel; the user must enable T3 Connect remote access first.`

### `Reuse when retrying a call that lost its result, so the user sees one card and its answer is returned again. Use a new id to ask again after timed_out or cancelled.`（message，1 处）

- 可疑位置：`packages/contracts/src/orchestratorMcp.ts:612`（C，OrchestratorMcpRequestSecretInput）
- 撞上的模板：`{first} and {second}`
- 运行时错误译文：`Reuse when retrying a call that lost its result, so the user sees one card 和 its answer is returned again. Use a new id to ask again after timed_out or cancelled.`

### `SSH {0}{1}`（template，1 处）

- 可疑位置：`packages/client-runtime/src/connection/routes.ts:198`（C，connectionRouteLabel）
- 撞上的模板：`SSH {0}`
- 运行时错误译文：`SSH {0}{1}`

### `Send an empty string to the extension.`（message，1 处）

- 可疑位置：`packages/provider-pi/src/server/adapter.ts:3237`（C，piQuestion）
- 撞上的模板：`Send {signal}`
- 运行时错误译文：`发送 an empty string to the extension.`

### `Set files directly on this <input type=file> instead of answering the open file picker.`（message，1 处）

- 可疑位置：`packages/contracts/src/previewAutomation.ts:511`（C，PreviewAutomationUploadInput）
- 撞上的模板：`{failure} on {environment}`
- 运行时错误译文：`this <input type=file> instead of answering the open file picker.上的Set files directly`

### `Shared signing secret. Omit to keep the stored secret.`（message，1 处）

- 可疑位置：`packages/contracts/src/scheduledTask.ts:108`（C，ScheduledTaskUpsertWebhookSchedule）
- 撞上的模板：`{head} to {base}`
- 运行时错误译文：`Shared signing secret. Omit 到 keep the stored secret.`

### `Signature check; omit or null to accept requests by URL token only.`（message，1 处）

- 可疑位置：`packages/contracts/src/scheduledTask.ts:117`（C，ScheduledTaskUpsertWebhookSchedule）
- 撞上的模板：`{head} to {base}`
- 运行时错误译文：`Signature check; omit or null 到 accept requests by URL token only.`

### `T3 could not confirm whether conversation history reached the provider. Retry the turn to recover the session.`（message，1 处）

- 可疑位置：`packages/provider-core/src/server/failure.ts:52`（C，causeMessage）
- 撞上的模板：`{head} to {base}`
- 运行时错误译文：`T3 could not confirm whether conversation history reached the provider. Retry the turn 到 recover the session.`

### `Task`（message，1 处）

- 可疑位置：`packages/provider-grok/src/server/xaiAcpExtension.ts:611`（C，resolveXAiAcpToolTitle）
- 撞上的模板：`{0}k`
- 运行时错误译文：`Task`

### `Text before the digest in the header value, such as 'sha256='. Empty for none.`（message，1 处）

- 可疑位置：`packages/contracts/src/scheduledTask.ts:67`（C，description）
- 撞上的模板：`{0} for {1}`
- 运行时错误译文：`none. 的 Text before the digest in the header value, such as 'sha256='. Empty`

### `The <select> element, for example aria-ref=<ref> or role=combobox[name='Size'].`（message，1 处）

- 可疑位置：`packages/contracts/src/previewAutomation.ts:459`（C，PreviewAutomationSelectInput）
- 撞上的模板：`{0} for {1}`
- 运行时错误译文：`example aria-ref=<ref> or role=combobox[name='Size']. 的 The <select> element,`

### `The server is not an OpenCode 2 server.`（message，1 处）

- 可疑位置：`packages/provider-opencode/src/server/v2/OpenCode2Server.ts:93`（C，describeInfoFailure）
- 撞上的模板：`{0} {1} is {2}`
- 运行时错误译文：`The server 的状态为 not an OpenCode 2 server.`

### `The values of the options now selected.`（message，1 处）

- 可疑位置：`packages/contracts/src/previewAutomation.ts:479`（C，PreviewAutomationSelectResult）
- 撞上的模板：`{selected} of {total}`
- 运行时错误译文：`已选 The values 个，共 the options now selected. 个`

### `Thread to update. Omit to update the calling thread.`（message，1 处）

- 可疑位置：`packages/contracts/src/threadMetadataMcp.ts:83`（C，ThreadMetadataMcpUpdateInput）
- 撞上的模板：`{head} to {base}`
- 运行时错误译文：`Thread 到 update. Omit to update the calling thread.`

### `Trigger object: {type:'interval', everyMs}, {type:'fixed_time', timeOfDay, weekdays?}, or {type:'webhook'} to run on each request to a generated URL. Never stringify it unless the provider requires the compatibility form.`（message，1 处）

- 可疑位置：`packages/contracts/src/orchestratorMcp.ts:68`（C，OrchestratorMcpSchedule）
- 撞上的模板：`{failure} on {environment}`
- 运行时错误译文：`each request to a generated URL. Never stringify it unless the provider requires the compatibility form.上的Trigger object: {type:'interval', everyMs}, {type:'fixed_time', timeOfDay, weekdays?}, or {type:'webhook'} to run`

### `Update project changes`（message，1 处）

- 可疑位置：`packages/provider-core/src/server/textGenerationUtils.ts:52`（C，sanitizePrTitle）
- 撞上的模板：`Update {0} {1}`
- 运行时错误译文：`更新 project changes`

### `When true, the script runs in the thread's worktree each time the thread settles, for example to delete build output. Threads without their own worktree skip it.`（message，1 处）

- 可疑位置：`packages/contracts/src/t3ProjectFile.ts:49`（C，T3ProjectFileScript）
- 撞上的模板：`{0} for {1}`
- 运行时错误译文：`example to delete build output. Threads without their own worktree skip it. 的 When true, the script runs in the thread's worktree each time the thread settles,`

### `declined: the user chose not to. cancelled: the request ended with the run. timed_out: the user did not answer in time; the card is closed, so ask again with a new clientRequestId if still needed.`（message，1 处）

- 可疑位置：`packages/contracts/src/orchestratorMcp.ts:628`（C，OrchestratorMcpRequestSecretResult）
- 撞上的模板：`{0} {1} is {2}`
- 运行时错误译文：`declined: the user chose not to. cancelled: the request ended with the run. timed_out: the user did not answer in time; the card 的状态为 closed, so ask again with a new clientRequestId if still needed.`

### `pi process closed stdout`（message，1 处）

- 可疑位置：`packages/provider-pi/src/server/rpc.ts:186`（C，describePiStdoutClosure）
- 撞上的模板：`{0} process {1}`
- 运行时错误译文：`pi 进程 closed stdout`

### `pi process exited with code {0}`（template，1 处）

- 可疑位置：`packages/provider-pi/src/server/rpc.ts:188`（C，describePiStdoutClosure）
- 撞上的模板：`{0} process {1}`
- 运行时错误译文：`pi 进程 exited with code {0}`

### `{0}{1}, tool call failed`（template，1 处）

- 可疑位置：`apps/web/src/components/chat/MessagesTimeline.tsx:3989`（B，LiveWorkEntryTimelineRow）
- 撞上的模板：`{0}, tool call failed`
- 运行时错误译文：`{0}{1}，工具调用失败`
