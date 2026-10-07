# 可疑项 v0.0.46-nightly.20261007.2774

价值用途与模板误配，默认都不转换。value-use 111 处（52 条文字）、template-collision 44 处（38 条文字）。

## value-use

这些文字也出现在「从不转换」的位置（比较、`switch case`、`as const`、字面量类型、对象键等），默认不转换。人工确认安全后，把精确的文字加进 `dict/allow-suspicious.json`（JSON 字符串数组）即可放行。

### `Commit`（message，14 处）

- 可疑位置：`apps/web/src/components/GitActionsControl.logic.ts:195`（C，buildMenuItems）；`apps/web/src/components/GitActionsControl.logic.ts:242`（C，resolveQuickAction）；`apps/web/src/components/GitActionsControl.logic.ts:247`（C，resolveQuickAction）；`apps/web/src/components/GitActionsControl.logic.ts:265`（C，resolveQuickAction）；`apps/web/src/components/GitActionsControl.logic.ts:274`（C，resolveQuickAction）；`apps/web/src/components/GitActionsControl.logic.ts:298`（C，resolveQuickAction）；`apps/web/src/components/GitActionsControl.logic.ts:365`（C，resolveQuickAction）；`apps/web/src/components/GitActionsControl.logic.ts:382`（C，resolveQuickAction）；`packages/client-runtime/src/state/gitActions.ts:78`（C，buildMenuItems）；`packages/client-runtime/src/state/gitActions.ts:118`（C，resolveQuickAction）；`packages/client-runtime/src/state/gitActions.ts:123`（C，resolveQuickAction）；`packages/client-runtime/src/state/gitActions.ts:139`（C，resolveQuickAction）；`packages/client-runtime/src/state/gitActions.ts:148`（C，resolveQuickAction）；`packages/client-runtime/src/state/gitActions.ts:239`（C，resolveQuickAction）
- 作为值用途字面量出现 1 次：`apps/web/src/components/GitActionsControl.tsx:390`（comparison）

### `Push`（message，9 处）

- 可疑位置：`apps/web/src/components/GitActionsControl.logic.ts:208`（C，buildMenuItems）；`apps/web/src/components/GitActionsControl.logic.ts:305`（C，resolveQuickAction）；`apps/web/src/components/GitActionsControl.logic.ts:313`（C，resolveQuickAction）；`apps/web/src/components/GitActionsControl.logic.ts:347`（C，resolveQuickAction）；`packages/client-runtime/src/state/gitActions.ts:86`（C，buildMenuItems）；`packages/client-runtime/src/state/gitActions.ts:167`（C，resolveQuickAction）；`packages/client-runtime/src/state/gitActions.ts:178`（C，resolveQuickAction）；`packages/client-runtime/src/state/gitActions.ts:186`（C，resolveQuickAction）；`packages/client-runtime/src/state/gitActions.ts:220`（C，resolveQuickAction）
- 作为值用途字面量出现 1 次：`apps/web/src/components/GitActionsControl.tsx:391`（comparison）

### `Browser`（message，5 处）

- 可疑位置：`apps/web/src/components/RightPanelTabs.tsx:341`（C，RightPanelEmptyState）；`apps/web/src/components/RightPanelTabs.tsx:608`（C，surfaceTitle）；`apps/web/src/components/RightPanelTabs.tsx:611`（C，surfaceTitle）；`apps/web/src/components/RightPanelTabs.tsx:613`（C，surfaceTitle）；`apps/web/src/components/RightPanelTabs.tsx:867`（C，RightPanelTabs）
- 作为值用途字面量出现 6 次：`apps/server/src/provider/CodexToolPresentation.ts:190`（comparison）；`apps/server/src/resourceTelemetry/Model.ts:104`（switch-case）；`apps/web/src/components/RightPanelTabs.tsx:518`（comparison）；`apps/web/src/components/RightPanelTabs.tsx:530`（comparison）；`apps/web/src/components/RightPanelTabs.tsx:1275`（comparison）；`packages/contracts/src/resourceTelemetry.ts:232`（schema-literal）

### `Mixed`（message，5 处）

- 可疑位置：`apps/web/src/components/settings/ProjectDefaultsSettings.tsx:167`（C，ProjectDefaultsSettings）；`apps/web/src/components/settings/SettingsPanels.tsx:3265`（C，GeneralSettingsPanel）；`apps/web/src/components/settings/SourceControlWritingSettings.tsx:311`（C，SourceControlWritingSettingsSection）；`apps/web/src/components/usage/usagePriceTable.ts:43`（C，usageAliasCell）；`apps/web/src/components/usage/usagePriceTable.ts:58`（C，usagePriceCell）
- 作为值用途字面量出现 1 次：`apps/web/src/components/usage/UsagePriceOverrides.tsx:212`（comparison）

### `Waiting`（message，5 处）

- 可疑位置：`apps/web/src/components/Sidebar.logic.ts:1211`（C，resolveThreadStatusPill）；`apps/web/src/components/Sidebar.tsx:1305`（C，SidebarThreadRow）；`apps/web/src/components/chat/ThreadRelationshipIcon.tsx:19`（C，threadRelationshipStatusLabel）；`apps/web/src/components/chat/V2LifecycleRow.tsx:250`（C，label）；`packages/client-runtime/src/state/threadExecution.ts:192`（C，SUBAGENT_STATUS_LABELS）
- 作为值用途字面量出现 2 次：`apps/web/src/components/Sidebar.logic.ts:633`（ts-type）；`apps/web/src/components/Sidebar.logic.ts:645`（object-key）

### `Completed`（message，4 处）

- 可疑位置：`apps/web/src/components/Sidebar.logic.ts:1234`（C，resolveThreadStatusPill）；`apps/web/src/components/chat/ComposerTasksBadge.tsx:25`（C，taskStatusLabels）；`apps/web/src/components/chat/V2LifecycleRow.tsx:252`（C，label）；`packages/client-runtime/src/state/threadExecution.ts:193`（C，SUBAGENT_STATUS_LABELS）
- 作为值用途字面量出现 3 次：`apps/web/src/components/Sidebar.logic.ts:630`（ts-type）；`apps/web/src/components/Sidebar.logic.ts:647`（object-key）；`packages/client-runtime/src/connection/supervisor.ts:92`（ts-type）

### `Unavailable`（message，4 处）

- 可疑位置：`apps/web/src/components/settings/ResourceTelemetryDiagnostics.tsx:162`（C，ioSemanticsLabel）；`apps/web/src/components/settings/providerStatus.ts:72`（C，getProviderSummary）；`apps/web/src/components/usage/usagePriceTable.ts:41`（C，usageAliasCell）；`apps/web/src/components/usage/usagePriceTable.ts:57`（C，usagePriceCell）
- 作为值用途字面量出现 2 次：`apps/web/src/components/settings/ResourceTelemetryDiagnostics.tsx:1217`（never-attribute）；`apps/web/src/components/usage/UsagePriceOverrides.tsx:213`（comparison）

### `Working`（message，4 处）

- 可疑位置：`apps/web/src/components/Sidebar.logic.ts:1189`（C，resolveThreadStatusPill）；`apps/web/src/components/Sidebar.tsx:1295`（C，SidebarThreadRow）；`packages/client-runtime/src/state/threadExecution.ts:190`（C，SUBAGENT_STATUS_LABELS）；`packages/client-runtime/src/state/threadExecution.ts:191`（C，SUBAGENT_STATUS_LABELS）
- 作为值用途字面量出现 2 次：`apps/web/src/components/Sidebar.logic.ts:628`（ts-type）；`apps/web/src/components/Sidebar.logic.ts:643`（object-key）

### `Agent`（message，3 处）

- 可疑位置：`apps/web/src/components/chat/TraitsPicker.tsx:47`（C，SAVED_OPTION_LABELS）；`apps/web/src/components/settings/DiagnosticsSettings.tsx:255`（C，formatProcessType）；`apps/web/src/components/settings/customModelEditor.logic.ts:112`（C，label）
- 作为值用途字面量出现 4 次：`apps/server/src/orchestration-v2/Adapters/ClaudeAdapterV2.ts:6162`（comparison）；`apps/server/src/orchestration-v2/Adapters/ClaudeAdapterV2.ts:6732`（comparison）；`apps/server/src/orchestration-v2/Adapters/ClaudeAdapterV2.ts:6755`（comparison）；`apps/server/src/provider/cursorSdk.ts:71`（object-key）

### `Antigravity`（message，3 处）

- 可疑位置：`apps/web/src/components/settings/providerDriverMeta.ts:86`（C，label）；`apps/web/src/components/usage/usageProviders.ts:40`（C，label）；`packages/contracts/src/editor.ts:64`（C，label）
- 作为值用途字面量出现 1 次：`packages/shared/src/nodeRuntime.ts:19`（schema-literal）

### `Branch`（message，3 处）

- 可疑位置：`apps/web/src/components/threadActionMenu.logic.ts:55`（C，buildDraftActionMenuItems）；`apps/web/src/components/threadActionMenu.logic.ts:227`（C，buildThreadActionMenuItems）；`packages/client-runtime/src/state/subagentDisplay.ts:108`（C，resolveSubagentMetadata）
- 作为值用途字面量出现 1 次：`apps/web/src/components/chat/SubagentTooltipContent.tsx:173`（comparison）

### `Cursor`（message，3 处）

- 可疑位置：`apps/web/src/components/settings/providerDriverMeta.ts:62`（C，label）；`apps/web/src/components/usage/usageProviders.ts:33`（C，label）；`packages/contracts/src/editor.ts:25`（C，label）
- 作为值用途字面量出现 2 次：`apps/server/src/provider/CursorProvider.ts:27`（as-const）；`apps/server/src/provider/cursorSdk.ts:74`（object-key）

### `Fast`（message，3 处）

- 可疑位置：`apps/web/src/components/chat/TraitsSpeed.tsx:14`（C，getTraitsSpeedDisplay）；`apps/web/src/components/settings/customModelEditor.logic.ts:64`（C，label）；`apps/web/src/components/usage/usageBreakdown.ts:83`（C，speedCostSegments）
- 作为值用途字面量出现 3 次：`apps/web/src/components/chat/TraitsPicker.tsx:512`（comparison）；`apps/web/src/components/chat/TraitsSpeed.tsx:22`（comparison）；`apps/web/src/components/settings/ProviderModelsSection.tsx:51`（comparison）

### `Alt`（message，2 处）

- 可疑位置：`apps/web/src/lib/snapShotShortcut.ts:68`（C，modifierKeyLabel）；`packages/contracts/src/settings.ts:212`（C，OTHER_MODIFIER_LABELS）
- 作为值用途字面量出现 6 次：`apps/desktop/src/preview/RecordingInput.ts:24`（comparison）；`apps/desktop/src/preview/RecordingInput.ts:41`（membership）；`apps/web/src/components/ComposerPromptEditorTiptap.tsx:1377`（comparison）；`apps/web/src/components/settings/useSnapShotShortcutRecorder.tsx:23`（object-key）；`apps/web/src/shortcutModifierState.ts:86`（switch-case）；`packages/contracts/src/previewAutomation.ts:542`（schema-literal）

### `Codex`（message，2 处）

- 可疑位置：`apps/web/src/components/settings/providerDriverMeta.ts:52`（C，label）；`apps/web/src/components/usage/usageProviders.ts:18`（C，label）
- 作为值用途字面量出现 1 次：`apps/server/src/provider/CodexProvider.ts:68`（as-const）

### `Connecting`（message，2 处）

- 可疑位置：`apps/web/src/components/Sidebar.logic.ts:1202`（C，resolveThreadStatusPill）；`packages/contracts/src/projectClone.ts:93`（C，projectCloneStageLabel）
- 作为值用途字面量出现 2 次：`apps/web/src/components/Sidebar.logic.ts:629`（ts-type）；`apps/web/src/components/Sidebar.logic.ts:644`（object-key）

### `Nightly`（message，2 处）

- 可疑位置：`apps/web/src/branding.logic.ts:20`（C，resolveServerBackedAppStageLabel）；`apps/web/src/components/SidebarStageBackdrop.tsx:31`（C，resolveEnvironmentIdentificationPillLabel）
- 作为值用途字面量出现 3 次：`apps/web/src/components/SidebarStageBackdrop.tsx:9`（ts-type）；`packages/contracts/src/ipc.ts:84`（ts-type）；`packages/contracts/src/ipc.ts:99`（schema-literal）

### `OpenCode`（message，2 处）

- 可疑位置：`apps/web/src/components/settings/providerDriverMeta.ts:81`（C，label）；`apps/web/src/components/usage/usageProviders.ts:35`（C，label）
- 作为值用途字面量出现 1 次：`apps/server/src/provider/OpenCodeProvider.ts:29`（as-const）

### `Shift`（message，2 处）

- 可疑位置：`packages/contracts/src/settings.ts:203`（C，APPLE_MODIFIER_LABELS）；`packages/contracts/src/settings.ts:209`（C，OTHER_MODIFIER_LABELS）
- 作为值用途字面量出现 6 次：`apps/desktop/src/preview/RecordingInput.ts:25`（comparison）；`apps/desktop/src/preview/RecordingInput.ts:41`（membership）；`apps/web/src/components/ComposerPromptEditorTiptap.tsx:1378`（comparison）；`apps/web/src/components/settings/useSnapShotShortcutRecorder.tsx:19`（object-key）；`apps/web/src/shortcutModifierState.ts:89`（switch-case）；`packages/contracts/src/previewAutomation.ts:542`（schema-literal）

### `T3 Code`（message，2 处）

- 可疑位置：`apps/web/src/components/settings/IntegrationsSettings.tsx:580`（C，LINK_TARGET_LABELS）；`apps/web/src/components/settings/ThemePreviewCircles.tsx:61`（C，label）
- 作为值用途字面量出现 1 次：`apps/server/src/cloud/cliAuthHtml.ts:12`（as-const）

### `Android`（message，1 处）

- 可疑位置：`packages/shared/src/thirdPartyLicenses.ts:100`（C，BUNDLE_LABELS）
- 作为值用途字面量出现 2 次：`apps/server/src/ws.ts:669`（comparison）；`packages/contracts/src/baseSchemas.ts:353`（schema-literal）

### `Awaiting Input`（message，1 处）

- 可疑位置：`apps/web/src/components/Sidebar.logic.ts:1180`（C，resolveThreadStatusPill）
- 作为值用途字面量出现 2 次：`apps/web/src/components/Sidebar.logic.ts:632`（ts-type）；`apps/web/src/components/Sidebar.logic.ts:642`（object-key）

### `Claude`（message，1 处）

- 可疑位置：`apps/web/src/components/settings/providerDriverMeta.ts:57`（C，label）
- 作为值用途字面量出现 1 次：`apps/server/src/provider/ClaudeProvider.ts:59`（as-const）

### `Command`（message，1 处）

- 可疑位置：`packages/contracts/src/settings.ts:204`（C，APPLE_MODIFIER_LABELS）
- 作为值用途字面量出现 2 次：`apps/web/src/lib/embeddedScripts.ts:244`（switch-case）；`apps/web/src/shortcutModifierState.ts:82`（switch-case）

### `Control`（message，1 处）

- 可疑位置：`packages/contracts/src/settings.ts:205`（C，APPLE_MODIFIER_LABELS）
- 作为值用途字面量出现 6 次：`apps/desktop/src/preview/RecordingInput.ts:23`（comparison）；`apps/desktop/src/preview/RecordingInput.ts:41`（membership）；`apps/web/src/components/ComposerPromptEditorTiptap.tsx:1375`（comparison）；`apps/web/src/components/settings/useSnapShotShortcutRecorder.tsx:22`（object-key）；`apps/web/src/shortcutModifierState.ts:84`（switch-case）；`packages/contracts/src/previewAutomation.ts:542`（schema-literal）

### `Dev`（message，1 处）

- 可疑位置：`apps/web/src/components/SidebarStageBackdrop.tsx:30`（C，resolveEnvironmentIdentificationPillLabel）
- 作为值用途字面量出现 3 次：`apps/web/src/components/SidebarStageBackdrop.tsx:9`（ts-type）；`packages/contracts/src/ipc.ts:84`（ts-type）；`packages/contracts/src/ipc.ts:99`（schema-literal）

### `Enter`（message，1 处）

- 可疑位置：`apps/web/src/components/settings/SettingsPanels.tsx:2176`（C，GeneralSettingsPanel）
- 作为值用途字面量出现 57 次：`apps/desktop/src/preview/AnnotationKeyboard.ts:15`（comparison）；`apps/desktop/src/preview/RecordingInput.ts:29`（object-key）；`apps/web/src/browser/ServerBrowserSurface.tsx:682`（comparison）；`apps/web/src/components/BranchPicker.tsx:183`（comparison）；`apps/web/src/components/ChatMarkdown.tsx:1600`（comparison）；`apps/web/src/components/CommandPalette.tsx:3097`（comparison）；`apps/web/src/components/CommandPalette.tsx:3107`（comparison）；`apps/web/src/components/CommandPalette.tsx:3120`（comparison）；`apps/web/src/components/CommandPalette.tsx:3162`（comparison）；`apps/web/src/components/ComposerPromptEditorTiptap.tsx:975`（comparison）；…（共 57 处）

### `GPU`（message，1 处）

- 可疑位置：`apps/web/src/components/settings/ResourceTelemetryDiagnostics.tsx:136`（C，categoryLabel）
- 作为值用途字面量出现 2 次：`apps/server/src/resourceTelemetry/Model.ts:108`（switch-case）；`packages/contracts/src/resourceTelemetry.ts:237`（schema-literal）

### `Grok`（message，1 处）

- 可疑位置：`apps/web/src/components/settings/providerDriverMeta.ts:76`（C，label）
- 作为值用途字面量出现 1 次：`apps/server/src/provider/GrokProvider.ts:49`（as-const）

### `Linux`（message，1 处）

- 可疑位置：`apps/web/src/components/ProviderUpdateLaunchNotification.logic.ts:698`（C，deriveEnvironmentDisplayLabel）
- 作为值用途字面量出现 2 次：`apps/web/src/components/CommandPalette.tsx:3215`（comparison）；`packages/contracts/src/baseSchemas.ts:351`（schema-literal）

### `New thread`（message，1 处）

- 可疑位置：`apps/web/src/components/ChatView.logic.ts:520`（C，buildLocalDraftThread）
- 作为值用途字面量出现 1 次：`apps/server/src/orchestration-v2/ThreadTitleRegenerationService.ts:118`（comparison）

### `Option`（message，1 处）

- 可疑位置：`packages/contracts/src/settings.ts:206`（C，APPLE_MODIFIER_LABELS）
- 作为值用途字面量出现 1 次：`apps/web/src/shortcutModifierState.ts:87`（switch-case）

### `Pending Approval`（message，1 处）

- 可疑位置：`apps/web/src/components/Sidebar.logic.ts:1171`（C，resolveThreadStatusPill）
- 作为值用途字面量出现 2 次：`apps/web/src/components/Sidebar.logic.ts:631`（ts-type）；`apps/web/src/components/Sidebar.logic.ts:641`（object-key）

### `Pi`（message，1 处）

- 可疑位置：`apps/web/src/components/settings/providerDriverMeta.ts:91`（C，label）
- 作为值用途字面量出现 1 次：`apps/server/src/provider/PiProvider.ts:61`（as-const）

### `Plan Ready`（message，1 处）

- 可疑位置：`apps/web/src/components/Sidebar.logic.ts:1225`（C，resolveThreadStatusPill）
- 作为值用途字面量出现 2 次：`apps/web/src/components/Sidebar.logic.ts:634`（ts-type）；`apps/web/src/components/Sidebar.logic.ts:646`（object-key）

### `Running source control action`（message，1 处）

- 可疑位置：`apps/web/src/state/sourceControlActions.ts:256`（C，useGitStackedAction）
- 作为值用途字面量出现 2 次：`apps/web/src/components/GitActionsControl.logic.ts:96`（comparison）；`packages/client-runtime/src/state/vcsAction.ts:463`（non-display-call）

### `Space`（message，1 处）

- 可疑位置：`apps/web/src/keybindings.ts:192`（C，formatShortcutKeyLabel）
- 作为值用途字面量出现 3 次：`apps/desktop/src/preview/RecordingInput.ts:39`（object-key）；`apps/web/src/terminal/ghostty/keyCodes.ts:68`（as-const）；`packages/client-runtime/src/device/stream.ts:291`（object-key）

### `This connection cannot change keyboard shortcuts.`（message，1 处）

- 可疑位置：`apps/web/src/components/projectScriptEditor.tsx:253`（D，submit）
- 作为值用途字面量出现 1 次：`apps/web/src/components/ChatView.tsx:5110`（error-constructor）

### `This connection cannot change threads.`（message，1 处）

- 可疑位置：`apps/web/src/components/ChatView.tsx:9310`（D，onSend）
- 作为值用途字面量出现 3 次：`apps/web/src/hooks/useThreadActionMenu.ts:173`（error-constructor）；`apps/web/src/hooks/useThreadActions.ts:263`（error-constructor）；`apps/web/src/state/sourceControlActions.ts:342`（error-constructor）

### `Windows`（message，1 处）

- 可疑位置：`apps/web/src/components/ProviderUpdateLaunchNotification.logic.ts:694`（C，deriveEnvironmentDisplayLabel）
- 作为值用途字面量出现 2 次：`apps/desktop/src/snapShot/NiriSnapShot.ts:44`（object-key）；`packages/contracts/src/baseSchemas.ts:350`（schema-literal）

### `auto`（message，1 处）

- 可疑位置：`packages/contracts/src/settings.ts:923`（C，AcpRegistrySettings）
- 作为值用途字面量出现 135 次：`apps/desktop/src/linuxSecretStorage.ts:2`（ts-type）；`apps/desktop/src/linuxSecretStorage.ts:7`（ts-type）；`apps/desktop/src/linuxSecretStorage.ts:48`（comparison）；`apps/server/src/mcp/OrchestratorMcpService.ts:486`（switch-case）；`apps/server/src/orchestration-v2/Adapters/AcpAdapterV2.ts:6236`（comparison）；`apps/server/src/orchestration-v2/Adapters/ClaudeAdapterV2.ts:1549`（switch-case）；`apps/server/src/orchestration-v2/Adapters/CodexAdapterV2.ts:681`（switch-case）；`apps/server/src/orchestration-v2/Adapters/GrokAdapterV2.ts:289`（comparison）；`apps/server/src/orchestration-v2/Adapters/OpenCodeAdapterV2.ts:3241`（object-key）；`apps/server/src/orchestration-v2/Adapters/OpenCodeAdapterV2.ts:3244`（object-key）；…（共 135 处）

### `claude`（message，1 处）

- 可疑位置：`packages/contracts/src/settings.ts:660`（C，ClaudeSettings）
- 作为值用途字面量出现 20 次：`apps/server/src/cli/triage.ts:43`（ts-type）；`apps/server/src/cli/triage.ts:146`（schema-literal）；`apps/server/src/observability/Attributes.ts:42`（membership）；`apps/server/src/provider/ClaudeProvider.ts:130`（string-method）；`apps/server/src/provider/ClaudeProvider.ts:133`（string-method）；`apps/server/src/telemetry/Identify.ts:31`（schema-literal）；`apps/server/src/telemetry/Identify.ts:50`（schema-literal）；`apps/server/src/telemetry/Identify.ts:214`（error-constructor）；`apps/server/src/usage/UsageService.ts:356`（comparison）；`apps/server/src/usage/cliproxyApi.ts:220`（comparison）；…（共 20 处）

### `codex`（message，1 处）

- 可疑位置：`packages/contracts/src/settings.ts:601`（C，CodexSettings）
- 作为值用途字面量出现 80 次：`apps/server/src/cli/triage.ts:43`（ts-type）；`apps/server/src/cli/triage.ts:146`（schema-literal）；`apps/server/src/project/AgentSessionImporter.ts:345`（comparison）；`apps/server/src/project/AgentSessionScanner.ts:305`（comparison）；`apps/server/src/project/AgentSessionScanner.ts:337`（comparison）；`apps/server/src/project/AgentSessionScanner.ts:1093`（as-const）；`apps/server/src/provider/CodexChatGptAuth.ts:274`（comparison）；`apps/server/src/provider/CodexManagedHome.ts:16`（comparison）；`apps/server/src/provider/CodexProvider.ts:642`（comparison）；`apps/server/src/provider/ModelManifest.ts:219`（comparison）；…（共 80 处）

### `devin`（message，1 处）

- 可疑位置：`packages/contracts/src/settings.ts:901`（C，AcpRegistrySettings）
- 作为值用途字面量出现 1 次：`apps/server/src/orchestration-v2/Adapters/AcpRegistryAdapterV2.ts:189`（comparison）

### `grok`（message，1 处）

- 可疑位置：`packages/contracts/src/settings.ts:746`（C，GrokSettings）
- 作为值用途字面量出现 22 次：`apps/server/src/provider/GrokProvider.ts:292`（comparison）；`apps/server/src/serverSettings.ts:391`（object-key）；`apps/server/src/serverSettings.ts:419`（comparison）；`apps/server/src/serverSettings.ts:435`（object-key）；`apps/server/src/serverSettings.ts:437`（membership）；`apps/server/src/serverSettings.ts:506`（object-key）；`apps/server/src/usage/UsageService.ts:312`（as-const）；`apps/server/src/usage/UsageService.ts:390`（comparison）；`apps/server/src/usage/usageScanCache.ts:303`（comparison）；`apps/server/src/usage/usageTranscriptReader.ts:96`（ts-type）；…（共 22 处）

### `iOS`（message，1 处）

- 可疑位置：`packages/shared/src/thirdPartyLicenses.ts:104`（C，BUNDLE_LABELS）
- 作为值用途字面量出现 2 次：`apps/server/src/ws.ts:669`（comparison）；`packages/contracts/src/baseSchemas.ts:352`（schema-literal）

### `macOS`（message，1 处）

- 可疑位置：`apps/web/src/components/ProviderUpdateLaunchNotification.logic.ts:696`（C，deriveEnvironmentDisplayLabel）
- 作为值用途字面量出现 1 次：`packages/contracts/src/baseSchemas.ts:349`（schema-literal）

### `opencode`（message，1 处）

- 可疑位置：`packages/contracts/src/settings.ts:954`（C，OpenCodeSettings）
- 作为值用途字面量出现 25 次：`apps/server/src/provider/OpenCodeProvider.ts:160`（comparison）；`apps/server/src/provider/ProviderRegistry.ts:224`（comparison）；`apps/server/src/provider/ProviderRegistry.ts:248`（comparison）；`apps/server/src/serverSettings.ts:392`（object-key）；`apps/server/src/serverSettings.ts:420`（comparison）；`apps/server/src/serverSettings.ts:439`（object-key）；`apps/server/src/serverSettings.ts:441`（membership）；`apps/server/src/serverSettings.ts:507`（object-key）；`apps/web/src/components/chat/ModelPickerContent.tsx:96`（comparison）；`apps/web/src/components/chat/ProviderInstanceIcon.tsx:27`（computed-key）；…（共 25 处）

### `pi`（message，1 处）

- 可疑位置：`packages/contracts/src/settings.ts:852`（C，PiSettings）
- 作为值用途字面量出现 6 次：`apps/web/src/components/chat/ProviderInstanceIcon.tsx:31`（computed-key）；`apps/web/src/components/chat/ProviderInstanceIcon.tsx:39`（computed-key）；`apps/web/src/components/settings/ProviderModelsSection.tsx:31`（computed-key）；`apps/web/src/components/settings/customModelEditor.logic.ts:92`（computed-key）；`packages/contracts/src/settings.ts:1448`（object-key）；`packages/contracts/src/settings.ts:1770`（object-key）

### `placeholder`（message，1 处）

- 可疑位置：`apps/web/src/components/settings/themeInspector.ts:42`（C，placeholder）
- 作为值用途字面量出现 114 次：`apps/server/src/mcp/OrchestratorMcpService.ts:1691`（object-key）；`apps/server/src/orchestration-v2/Orchestrator.ts:7020`（object-key）；`apps/server/src/secrets/SecretRequests.ts:156`（object-key）；`apps/web/src/components/CommandPalette.tsx:3460`（object-key）；`apps/web/src/components/ComposerPromptEditorTiptap.tsx:131`（object-key）；`apps/web/src/components/ComposerPromptEditorTiptap.tsx:625`（object-key）；`apps/web/src/components/Sidebar.drag.ts:218`（string-method）；`apps/web/src/components/device/DeviceToolsPanel.tsx:377`（object-key）；`apps/web/src/components/device/DeviceToolsPanel.tsx:410`（object-key）；`apps/web/src/components/diffs/DiffCommentAnnotation.tsx:24`（object-key）；…（共 114 处）

### `show-link-context-menu`（message，1 处）

- 可疑位置：`apps/web/src/components/chat/externalLinkContextMenu.ts:114`（D，showExternalLinkContextMenu）
- 作为值用途字面量出现 1 次：`apps/web/src/components/chat/externalLinkContextMenu.ts:11`（ts-type）

### `text-primary`（message，1 处）

- 可疑位置：`apps/web/src/components/ui/collapsible-section-header.tsx:9`（C，label）
- 作为值用途字面量出现 7 次：`apps/web/src/components/Sidebar.tsx:769`（non-display-call）；`apps/web/src/components/auth/ConnectAgentSurface.tsx:324`（non-display-call）；`apps/web/src/components/chat/ComposerTasksBadge.tsx:176`（non-display-call）；`apps/web/src/components/chat/MessageCopyButton.tsx:53`（non-display-call）；`apps/web/src/components/preview/PreviewChromeRow.tsx:250`（non-display-call）；`apps/web/src/components/preview/PreviewChromeRow.tsx:303`（non-display-call）；`apps/web/src/components/settings/SettingInheritance.tsx:219`（non-display-call）

## template-collision

这些文字（或带表达式的模板字面量）不在 `messages` 里，却会被某条 `templates` 匹配，运行时会得到半中半英的错误译文。默认不转换。处理办法：给它补一条**精确的 `messages` 词条**（静态文本），或收窄/删除撞上的那条模板。

### `Environment-relative target. Prefer {kind:'environment-port',port:5173} for a dev server in the current environment.`（message，2 处）

- 可疑位置：`packages/contracts/src/previewAutomation.ts:217`（C，PreviewAutomationNavigateInput）；`packages/contracts/src/previewAutomation.ts:221`（C，PreviewAutomationNavigateInput）
- 撞上的模板：`{0} for {1}`
- 运行时错误译文：`a dev server in the current environment. 的 Environment-relative target. Prefer {kind:'environment-port',port:5173}`

### `JavaScript expression evaluated in the page's main frame, for example document.title or (() => ({href: location.href}))().`（message，2 处）

- 可疑位置：`packages/contracts/src/previewAutomation.ts:590`（C，PreviewAutomationEvaluateInput）；`packages/contracts/src/previewAutomation.ts:596`（C，PreviewAutomationEvaluateInput）
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

### `Use locator='aria-ref=<ref>' with a ref from the latest server snapshot (including iframe elements), or a unique Playwright role/text selector. Refs expire on navigation, a new snapshot, or control handoff; refresh the snapshot after a stale-ref error.`（message，2 处）

- 可疑位置：`packages/contracts/src/previewAutomation.ts:347`（C，Locator）；`packages/contracts/src/previewAutomation.ts:363`（C，description）
- 撞上的模板：`{failure} on {environment}`
- 运行时错误译文：`navigation, a new snapshot, or control handoff; refresh the snapshot after a stale-ref error.上的Use locator='aria-ref=<ref>' with a ref from the latest server snapshot (including iframe elements), or a unique Playwright role/text selector. Refs expire`

### `gh`（message，2 处）

- 可疑位置：`apps/web/src/components/settings/GitHubAccountSettings.tsx:89`（A，GitHubAccountSettings）；`apps/web/src/components/settings/GitHubTokenSettings.tsx:73`（A，GitHubTokenSettings）
- 撞上的模板：`{0}h`
- 运行时错误译文：`g 小时`

### `1 for a click, 2 for a double-click, 3 for a triple-click. Defaults to 1.`（message，1 处）

- 可疑位置：`packages/contracts/src/previewAutomation.ts:404`（C，PreviewAutomationClickInput）
- 撞上的模板：`{0} for {1}`
- 运行时错误译文：`a click, 2 for a double-click, 3 for a triple-click. Defaults to 1. 的 1`

### `A secret the user entered through request_secret, used instead of secret. It is consumed by this save.`（message，1 处）

- 可疑位置：`packages/contracts/src/scheduledTask.ts:112`（C，ScheduledTaskUpsertWebhookSchedule）
- 撞上的模板：`{0} {1} is {2}`
- 运行时错误译文：`A secret the user entered through request_secret, used instead of secret. It 的状态为 consumed by this save.`

### `Absolute paths of files on the environment to give the page. An empty list cancels the open file picker.`（message，1 处）

- 可疑位置：`packages/contracts/src/previewAutomation.ts:474`（C，PreviewAutomationUploadInput）
- 撞上的模板：`{failure} on {environment}`
- 运行时错误译文：`the environment to give the page. An empty list cancels the open file picker.上的Absolute paths of files`

### `Answers the page's open file picker, or sets files on a file input when locator/selector is given.`（message，1 处）

- 可疑位置：`packages/contracts/src/previewAutomation.ts:494`（C，PreviewAutomationUploadInput）
- 撞上的模板：`{0} {1} is {2}`
- 运行时错误译文：`Answers the page's open file picker, or sets files on a file input when locator/selector 的状态为 given.`

### `Chooses options in one native <select> element.`（message，1 处）

- 可疑位置：`packages/contracts/src/previewAutomation.ts:444`（C，PreviewAutomationSelectInput）
- 撞上的模板：`{0} in {1}`
- 运行时错误译文：`Chooses options，用时 one native <select> element.`

### `Drags one element and drops it onto another.`（message，1 处）

- 可疑位置：`packages/contracts/src/previewAutomation.ts:467`（C，PreviewAutomationDragInput）
- 撞上的模板：`{first} and {second}`
- 运行时错误译文：`Drags one element 和 drops it onto another.`

### `Each request runs the prompt. Use {{body.path}}, {{headers.name}}, {{query.name}}, {{body}} or {{request}} in the prompt; only what it names reaches the agent.`（message，1 处）

- 可疑位置：`apps/web/src/components/settings/ScheduledTasksSettings.tsx:1176`（A，ScheduledTaskEditorDialog）
- 撞上的模板：`{0} in {1}`
- 运行时错误译文：`Each request runs the prompt. Use {{body.path}}, {{headers.name}}, {{query.name}}, {{body}} or {{request}}，用时 the prompt; only what it names reaches the agent.`

### `How long to wait for the user. Default 10 minutes.`（message，1 处）

- 可疑位置：`packages/contracts/src/orchestratorMcp.ts:611`（C，OrchestratorMcpRequestSecretInput）
- 撞上的模板：`{0} for {1}`
- 运行时错误译文：`the user. Default 10 minutes. 的 How long to wait`

### `How the HMAC-SHA256 digest is encoded in the header.`（message，1 处）

- 可疑位置：`packages/contracts/src/scheduledTask.ts:64`（C，description）
- 撞上的模板：`{0} {1} is {2}`
- 运行时错误译文：`How the HMAC-SHA256 digest 的状态为 encoded in the header.`

### `Legacy CSS selector for a <select>. Prefer locator.`（message，1 处）

- 可疑位置：`packages/contracts/src/previewAutomation.ts:426`（C，PreviewAutomationSelectInput）
- 撞上的模板：`{0} for {1}`
- 运行时错误译文：`a <select>. Prefer locator. 的 Legacy CSS selector`

### `Legacy CSS selector for an <input type=file>. Prefer locator.`（message，1 处）

- 可疑位置：`packages/contracts/src/previewAutomation.ts:477`（C，PreviewAutomationUploadInput）
- 撞上的模板：`{0} for {1}`
- 运行时错误译文：`an <input type=file>. Prefer locator. 的 Legacy CSS selector`

### `Mouse button. Defaults to left; right opens the page's context menu.`（message，1 处）

- 可疑位置：`packages/contracts/src/previewAutomation.ts:399`（C，PreviewAutomationClickInput）
- 撞上的模板：`{head} to {base}`
- 运行时错误译文：`Mouse button. Defaults 到 left; right opens the page's context menu.`

### `Moves the mouse over one target. Provide exactly one of locator, selector, or the x/y coordinate pair.`（message，1 处）

- 可疑位置：`packages/contracts/src/previewAutomation.ts:419`（C，PreviewAutomationHoverInput）
- 撞上的模板：`{selected} of {total}`
- 运行时错误译文：`已选 Moves the mouse over one target. Provide exactly one 个，共 locator, selector, or the x/y coordinate pair. 个`

### `One or two sentences on what it is for and where the user gets or also enters it.`（message，1 处）

- 可疑位置：`packages/contracts/src/orchestratorMcp.ts:604`（C，OrchestratorMcpRequestSecretInput）
- 撞上的模板：`{first} and {second}`
- 运行时错误译文：`One or two sentences on what it is for 和 where the user gets or also enters it.`

### `Only list this project's tasks. Omit for the calling thread's project, or for every project when the caller is not a T3 thread.`（message，1 处）

- 可疑位置：`packages/contracts/src/orchestratorMcp.ts:574`（C，OrchestratorMcpListScheduledTasksInput）
- 撞上的模板：`{0} {1} is {2}`
- 运行时错误译文：`Only list this project's tasks. Omit for the calling thread's project, or for every project when the caller 的状态为 not a T3 thread.`

### `Option values or visible labels to select. Pass several for a multiple select, or an empty list to clear it.`（message，1 处）

- 可疑位置：`packages/contracts/src/previewAutomation.ts:433`（C，PreviewAutomationSelectInput）
- 撞上的模板：`{0} for {1}`
- 运行时错误译文：`a multiple select, or an empty list to clear it. 的 Option values or visible labels to select. Pass several`

### `Optional text to submit when accepting a prompt dialog.`（message，1 处）

- 可疑位置：`packages/contracts/src/previewAutomation.ts:137`（C，PreviewAutomationDialogInput）
- 撞上的模板：`{head} to {base}`
- 运行时错误译文：`Optional text 到 submit when accepting a prompt dialog.`

### `Pass it to a tool that accepts a secretRef; it works once, and you never see the value.`（message，1 处）

- 可疑位置：`packages/contracts/src/orchestratorMcp.ts:624`（C，OrchestratorMcpRequestSecretResult）
- 撞上的模板：`{leading}, and {last}`
- 运行时错误译文：`Pass it to a tool that accepts a secretRef; it works once 和 you never see the value.`

### `Project to act on. Omit for the calling thread's project; required when the caller is not a T3 thread.`（message，1 处）

- 可疑位置：`packages/contracts/src/orchestratorMcp.ts:287`（C，OrchestratorMcpProjectTarget）
- 撞上的模板：`{0} {1} is {2}`
- 运行时错误译文：`Project to act on. Omit for the calling thread's project; required when the caller 的状态为 not a T3 thread.`

### `Public URL to give the sender. Absent when this environment has no T3 Connect managed tunnel; the user must enable T3 Connect remote access first.`（message，1 处）

- 可疑位置：`packages/contracts/src/orchestratorMcp.ts:559`（C，OrchestratorMcpScheduledTask）
- 撞上的模板：`{head} to {base}`
- 运行时错误译文：`Public URL 到 give the sender. Absent when this environment has no T3 Connect managed tunnel; the user must enable T3 Connect remote access first.`

### `Reuse when retrying a call that lost its result, so the user sees one card and its answer is returned again. Use a new id to ask again after timed_out or cancelled.`（message，1 处）

- 可疑位置：`packages/contracts/src/orchestratorMcp.ts:614`（C，OrchestratorMcpRequestSecretInput）
- 撞上的模板：`{first} and {second}`
- 运行时错误译文：`Reuse when retrying a call that lost its result, so the user sees one card 和 its answer is returned again. Use a new id to ask again after timed_out or cancelled.`

### `SSH {0}{1}`（template，1 处）

- 可疑位置：`packages/client-runtime/src/connection/routes.ts:183`（C，connectionRouteLabel）
- 撞上的模板：`SSH {0}`
- 运行时错误译文：`SSH {0}{1}`

### `Set files directly on this <input type=file> instead of answering the open file picker.`（message，1 处）

- 可疑位置：`packages/contracts/src/previewAutomation.ts:481`（C，PreviewAutomationUploadInput）
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

### `Text before the digest in the header value, such as 'sha256='. Empty for none.`（message，1 处）

- 可疑位置：`packages/contracts/src/scheduledTask.ts:67`（C，description）
- 撞上的模板：`{0} for {1}`
- 运行时错误译文：`none. 的 Text before the digest in the header value, such as 'sha256='. Empty`

### `The <select> element, for example aria-ref=<ref> or role=combobox[name='Size'].`（message，1 处）

- 可疑位置：`packages/contracts/src/previewAutomation.ts:429`（C，PreviewAutomationSelectInput）
- 撞上的模板：`{0} for {1}`
- 运行时错误译文：`example aria-ref=<ref> or role=combobox[name='Size']. 的 The <select> element,`

### `The values of the options now selected.`（message，1 处）

- 可疑位置：`packages/contracts/src/previewAutomation.ts:449`（C，PreviewAutomationSelectResult）
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

### `When true, the script runs in the thread's worktree each time the thread settles, for example to delete build output. Threads without their own worktree skip it.`（message，1 处）

- 可疑位置：`packages/contracts/src/t3ProjectFile.ts:49`（C，T3ProjectFileScript）
- 撞上的模板：`{0} for {1}`
- 运行时错误译文：`example to delete build output. Threads without their own worktree skip it. 的 When true, the script runs in the thread's worktree each time the thread settles,`

### `declined: the user chose not to. cancelled: the request ended with the run. timed_out: the user did not answer in time; the card is closed, so ask again with a new clientRequestId if still needed.`（message，1 处）

- 可疑位置：`packages/contracts/src/orchestratorMcp.ts:630`（C，OrchestratorMcpRequestSecretResult）
- 撞上的模板：`{0} {1} is {2}`
- 运行时错误译文：`declined: the user chose not to. cancelled: the request ended with the run. timed_out: the user did not answer in time; the card 的状态为 closed, so ask again with a new clientRequestId if still needed.`
