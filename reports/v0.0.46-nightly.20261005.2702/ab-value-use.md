# A/B 值用途重名 v0.0.46-nightly.20261005.2702

A（JSX 文本/子表达式）和 B 原始白名单属性的文字，即使同一文本也出现在「从不转换」的值用途位置（比较、`switch case`、`as const`、字面量类型、对象键），仍照常转换——它们只用于显示。§4 要求把这些位置列出以便人工核对：若上游将来改成拿这些字段做判断，就需要改判定。

共 211 处显示位置（112 条文字）。此清单与 suspicious、可翻译计数分开统计，不计入可翻译位置总数。

### `Off`（A，message，10 处）

- 显示位置（照常转换）：`apps/web/src/components/chat/TraitsPicker.tsx:474`（A，TraitsMenuContent）；`apps/web/src/components/clerk/MobileClientsUserProfilePage.tsx:31`（A，MobileClientStatusBadge）；`apps/web/src/components/settings/ConnectionsSettings.tsx:3309`（A，renderWslRow）；`apps/web/src/components/settings/GitHubRoutingSettings.tsx:72`（B，GitHubRoutingSettings）；`apps/web/src/components/settings/LoadBalancingSettings.tsx:77`（B，LoadBalancingSettings）；`apps/web/src/components/settings/SnapShotSettings.tsx:500`（A，SnapShotSettings）；`apps/web/src/components/settings/SnapShotSettings.tsx:517`（A，SnapShotSettings）；`apps/web/src/components/settings/StorageSettings.tsx:74`（A，RetentionControl）；`apps/web/src/components/settings/StorageSettings.tsx:185`（A，StorageSettingsPanel）；`apps/web/src/components/settings/StorageSettings.tsx:191`（A，StorageSettingsPanel）
- 同一文本作为值用途字面量出现 2 次：`packages/shared/src/otelEnvironment.ts:32`（object-key）；`packages/shared/src/otelEnvironment.ts:392`（object-key）

### `Close`（B，message，8 处）

- 显示位置（照常转换）：`apps/web/src/components/files/AttachmentFilePreview.tsx:347`（B，AttachmentFilePreview）；`apps/web/src/components/onboarding/WelcomeWizard.tsx:1105`（A，AgentInstallTerminal）；`apps/web/src/components/pullRequest/PullRequestDetailPanel.tsx:2844`（A，PullRequestDetailPanel）；`apps/web/src/components/settings/BrowserImportWizard.tsx:601`（A，BlockedStep）；`apps/web/src/components/settings/ProjectFaviconPickerDialog.tsx:80`（B，ProjectFaviconPickerDialog）；`apps/web/src/components/settings/SnapShotSetupDialog.tsx:392`（A，SnapShotSetupDialog）；`apps/web/src/components/ui/dialog.tsx:96`（B，DialogPopup）；`apps/web/src/components/ui/sheet.tsx:112`（B，SheetPopup）
- 同一文本作为值用途字面量出现 2 次：`apps/desktop/src/backend/DesktopBackendPool.ts:208`（ts-type）；`apps/desktop/src/backend/DesktopBackendPool.ts:394`（as-const）

### `Default`（A，message，5 处）

- 显示位置（照常转换）：`apps/web/src/components/chat/TraitsPicker.tsx:98`（A，DefaultBadge）；`apps/web/src/components/settings/ConnectionsSettings.tsx:1359`（A，AdvertisedEndpointListRow）；`apps/web/src/components/settings/CustomModelEditor.tsx:181`（A，renderChoice）；`apps/web/src/components/settings/DeviceHostEditor.tsx:131`（B，DeviceHostEditor）；`apps/web/src/components/settings/IntegrationsSettings.tsx:1292`（A，BrowserProfilesSetting）
- 同一文本作为值用途字面量出现 4 次：`apps/web/src/components/device/DeviceControlsRail.tsx:167`（as-const）；`apps/web/src/components/settings/KeybindingsSettings.logic.ts:48`（ts-type）；`apps/web/src/components/settings/KeybindingsSettings.tsx:927`（comparison）；`apps/web/src/components/settings/KeybindingsSettings.tsx:962`（comparison）

### `None`（A，message，5 处）

- 显示位置（照常转换）：`apps/web/src/components/device/DeviceToolVersions.tsx:69`（A，DeviceToolVersions）；`apps/web/src/components/pullRequest/PullRequestGhosts.tsx:363`（A，PullRequestDetailGhost）；`apps/web/src/components/pullRequest/PullRequestSummaryTab.tsx:717`（A，PullRequestSummaryTab）；`apps/web/src/components/pullRequest/PullRequestSummaryTab.tsx:802`（A，PullRequestSummaryTab）；`apps/web/src/components/settings/ScheduledTasksSettings.tsx:1218`（B，ScheduledTaskEditorDialog）
- 同一文本作为值用途字面量出现 14 次：`apps/server/src/device/LocalDeviceHost.ts:320`（comparison）；`apps/server/src/orchestration-v2/Adapters/OpenCode2AdapterV2.ts:1896`（comparison）；`apps/server/src/orchestration-v2/Adapters/OpenCode2AdapterV2.ts:2855`（comparison）；`apps/server/src/orchestration-v2/Adapters/OpenCode2AdapterV2.ts:2937`（comparison）；`apps/server/src/orchestration-v2/Adapters/OpenCode2AdapterV2.ts:3933`（comparison）；`apps/server/src/project/RepositoryIdentityResolver.ts:113`（comparison）；`apps/server/src/project/RepositoryIdentityResolver.ts:135`（comparison）；`apps/server/src/sourceControl/PrTemplateDetection.ts:91`（ts-type）；`apps/server/src/sourceControl/PrTemplateDetection.ts:124`（as-const）；`apps/server/src/vcs/VcsStatusBroadcaster.ts:161`（comparison）；…（共 14 处）

### `Sign in`（A，message，5 处）

- 显示位置（照常转换）：`apps/web/src/components/cloud/ConnectCliAuthSurface.tsx:107`（A，ConnectCliAuthorizeSurface）；`apps/web/src/components/onboarding/WelcomeWizard.tsx:473`（A，ConnectAccountOption）；`apps/web/src/components/onboarding/WelcomeWizard.tsx:971`（A，AgentCard）；`apps/web/src/components/settings/ProviderAuthenticationSection.tsx:298`（A，ProviderAuthenticationSection）；`apps/web/src/components/settings/ProviderWizardAuthenticationStep.tsx:71`（A，ProviderWizardAuthenticationStep）
- 同一文本作为值用途字面量出现 1 次：`apps/web/src/components/settings/AddProviderInstanceDialog.logic.ts:9`（as-const）

### `Unavailable`（A，message，5 处）

- 显示位置（照常转换）：`apps/web/src/components/chat/ModelListRow.tsx:82`（A，ModelListRow）；`apps/web/src/components/chat/ProviderModelPicker.tsx:279`（A，ProviderModelPicker）；`apps/web/src/components/cloud/CloudEnvironmentConnectList.tsx:414`（A，CloudEnvironmentConnectRows）；`apps/web/src/components/settings/CodexSetupSection.tsx:1053`（B，CodexManagedRuntimeFields）；`apps/web/src/components/settings/CodexSetupSection.tsx:1072`（B，CodexManagedRuntimeFields）
- 同一文本作为值用途字面量出现 2 次：`apps/web/src/components/settings/ResourceTelemetryDiagnostics.tsx:1193`（never-attribute）；`apps/web/src/components/usage/UsagePriceOverrides.tsx:216`（comparison）

### `Actions`（A，message，4 处）

- 显示位置（照常转换）：`apps/web/src/components/ProjectScriptsControl.tsx:372`（A，ProjectScriptsControl）；`apps/web/src/components/ProjectScriptsControl.tsx:416`（A，ProjectScriptsControl）；`apps/web/src/components/settings/ProjectActionsSettings.tsx:133`（B，ProjectActionsSettings）；`apps/web/src/components/settings/ProjectActionsSettings.tsx:138`（B，ProjectActionsSettings）
- 同一文本作为值用途字面量出现 1 次：`apps/web/src/components/chat/ComposerBanner.tsx:352`（object-key）

### `Codex`（B，message，4 处）

- 显示位置（照常转换）：`apps/web/src/components/onboarding/WelcomeWizard.tsx:1680`（B，ImportRowMeta）；`apps/web/src/components/settings/CodexSetupSection.tsx:68`（B，CodexSetupSection）；`apps/web/src/components/settings/CodexSetupSection.tsx:128`（B，CodexSetupSection）；`apps/web/src/components/settings/CodexSetupSection.tsx:768`（B，ManagedCodexSetup）
- 同一文本作为值用途字面量出现 1 次：`apps/server/src/provider/Layers/CodexProvider.ts:68`（as-const）

### `Command`（A，message，4 处）

- 显示位置（照常转换）：`apps/web/src/components/projectScriptEditor.tsx:379`（A，ProjectScriptEditorDialog）；`apps/web/src/components/settings/DiagnosticsSettings.tsx:364`（A，ProcessDiagnosticsTable）；`apps/web/src/components/settings/DiagnosticsSettings.tsx:593`（A，ProcessResourceHistoryTable）；`apps/web/src/components/settings/KeybindingsSettings.tsx:1141`（B，NewKeybindingCommandSelect）
- 同一文本作为值用途字面量出现 2 次：`apps/web/src/lib/embeddedScripts.ts:244`（switch-case）；`apps/web/src/shortcutModifierState.ts:82`（switch-case）

### `Enter`（A，message，4 处）

- 显示位置（照常转换）：`apps/web/src/components/CommandPalette.tsx:3304`（A，OpenCommandPaletteDialog）；`apps/web/src/components/CommandPalette.tsx:3331`（A，OpenCommandPaletteDialog）；`apps/web/src/components/CommandPalette.tsx:3371`（A，OpenCommandPaletteDialog）；`apps/web/src/components/CommandPaletteContent.tsx:80`（A，CommandPaletteContent）
- 同一文本作为值用途字面量出现 57 次：`apps/desktop/src/preview/AnnotationKeyboard.ts:14`（comparison）；`apps/desktop/src/preview/PreviewKeyboard.ts:40`（object-key）；`apps/desktop/src/preview/RecordingInput.ts:29`（object-key）；`apps/web/src/components/BranchPicker.tsx:183`（comparison）；`apps/web/src/components/ChatMarkdown.tsx:1540`（comparison）；`apps/web/src/components/CommandPalette.tsx:3066`（comparison）；`apps/web/src/components/CommandPalette.tsx:3076`（comparison）；`apps/web/src/components/CommandPalette.tsx:3089`（comparison）；`apps/web/src/components/CommandPalette.tsx:3131`（comparison）；`apps/web/src/components/ComposerPromptEditorTiptap.tsx:962`（comparison）；…（共 57 处）

### `Loading`（A，message，4 处）

- 显示位置（照常转换）：`apps/web/src/components/settings/AcpSessionManagementSection.tsx:343`（A，AcpSessionManagementSection）；`apps/web/src/components/settings/AcpSessionManagementSection.tsx:416`（A，AcpSessionManagementSection）；`apps/web/src/components/settings/AcpSessionManagementSection.tsx:439`（A，AcpSessionManagementSection）；`apps/web/src/components/ui/spinner.tsx:31`（B，Spinner）
- 同一文本作为值用途字面量出现 11 次：`apps/desktop/src/preview/Manager.ts:99`（ts-type）；`apps/desktop/src/preview/Manager.ts:2407`（comparison）；`apps/desktop/src/preview/Manager.ts:2459`（comparison）；`apps/desktop/src/preview/Manager.ts:3774`（comparison）；`apps/web/src/components/preview/PreviewAutomationHosts.tsx:262`（comparison）；`apps/web/src/components/preview/PreviewView.tsx:156`（comparison）；`apps/web/src/components/preview/usePreviewBridge.ts:109`（comparison）；`apps/web/src/components/preview/usePreviewBridge.ts:109`（comparison）；`apps/web/src/components/preview/usePreviewBridge.ts:120`（comparison）；`packages/client-runtime/src/state/assets.ts:71`（ts-type）；…（共 11 处）

### `Mixed`（B，message，4 处）

- 显示位置（照常转换）：`apps/web/src/components/settings/BranchNamingSettings.tsx:100`（B，BranchNamingSettings）；`apps/web/src/components/settings/ProjectDefaultsSettings.tsx:311`（A，ProjectDefaultsSettings）；`apps/web/src/components/settings/SettingsPanels.tsx:3091`（B，GeneralSettingsPanel）；`apps/web/src/components/settings/StorageSettings.tsx:181`（A，StorageSettingsPanel）
- 同一文本作为值用途字面量出现 1 次：`apps/web/src/components/usage/UsagePriceOverrides.tsx:215`（comparison）

### `Ready`（A，message，4 处）

- 显示位置（照常转换）：`apps/web/src/components/device/DeviceSetup.tsx:309`（A，PlatformStatus）；`apps/web/src/components/onboarding/WelcomeWizard.tsx:955`（A，AgentCard）；`apps/web/src/components/settings/CodexSetupSection.tsx:98`（A，CodexSetupSection）；`apps/web/src/components/settings/CodexSetupSection.tsx:810`（A，ManagedCodexSetup）
- 同一文本作为值用途字面量出现 5 次：`apps/desktop/src/backend/DesktopBackendConfiguration.ts:283`（ts-type）；`apps/desktop/src/backend/DesktopBackendConfiguration.ts:439`（as-const）；`apps/desktop/src/backend/DesktopBackendConfiguration.ts:490`（as-const）；`apps/desktop/src/backend/DesktopBackendConfiguration.ts:703`（comparison）；`apps/desktop/src/backend/DesktopBackendConfiguration.ts:745`（comparison）

### `file`（A，message，4 处）

- 显示位置（照常转换）：`apps/web/src/components/chat/ThreadDetailsPrRow.tsx:295`（A，ThreadDetailsPrRow）；`apps/web/src/components/pullRequest/PullRequestCodeTab.tsx:1122`（A，PullRequestCodeTab）；`apps/web/src/components/pullRequest/PullRequestDetailPanel.tsx:2476`（A，PullRequestDetailPanel）；`apps/web/src/components/pullRequest/PullRequestSummaryTab.tsx:421`（A，CommentGroup）
- 同一文本作为值用途字面量出现 188 次：`apps/desktop/src/permissions/MacPermissionHelper.ts:143`（object-key）；`apps/server/src/assets/AssetAccess.ts:171`（ts-type）；`apps/server/src/assets/AssetAccess.ts:176`（object-key）；`apps/server/src/assets/AssetAccess.ts:914`（object-key）；`apps/server/src/assets/AttachmentUpload.ts:46`（schema-literal）；`apps/server/src/assets/AttachmentUpload.ts:99`（comparison）；`apps/server/src/assets/AttachmentUpload.ts:165`（comparison）；`apps/server/src/attachmentStore.ts:147`（switch-case）；`apps/server/src/http.ts:167`（object-key）；`apps/server/src/http.ts:491`（object-key）；…（共 188 处）

### `files`（A，message，4 处）

- 显示位置（照常转换）：`apps/web/src/components/chat/ThreadDetailsPrRow.tsx:295`（A，ThreadDetailsPrRow）；`apps/web/src/components/pullRequest/PullRequestCodeTab.tsx:1122`（A，PullRequestCodeTab）；`apps/web/src/components/pullRequest/PullRequestDetailPanel.tsx:2476`（A，PullRequestDetailPanel）；`apps/web/src/components/pullRequest/PullRequestSummaryTab.tsx:421`（A，CommentGroup）
- 同一文本作为值用途字面量出现 175 次：`apps/desktop/src/snapShot/CaptureShortcutConfig.ts:99`（object-key）；`apps/desktop/src/snapShot/CaptureShortcutConfig.ts:209`（object-key）；`apps/desktop/src/snapShot/CaptureShortcutConfig.ts:224`（object-key）；`apps/server/src/git/GitManager.ts:1029`（object-key）；`apps/server/src/git/GitWorkflowService.ts:129`（object-key）；`apps/server/src/orchestration-v2/Adapters/CursorAdapterV2.ts:461`（comparison）；`apps/server/src/orchestration-v2/Adapters/CursorAdapterV2.ts:666`（object-key）；`apps/server/src/orchestration-v2/Adapters/OpenCode2AdapterV2.ts:3103`（object-key）；`apps/server/src/orchestration-v2/CheckpointCaptureService.ts:283`（object-key）；`apps/server/src/orchestration-v2/CheckpointService.ts:223`（object-key）；…（共 175 处）

### `Android`（A，message，3 处）

- 显示位置（照常转换）：`apps/web/src/components/NightlyMobileBeta.tsx:131`（A，NightlyMobileBetaRow）；`apps/web/src/components/RightPanelTabs.tsx:1407`（A，DeviceTabTooltip）；`apps/web/src/components/device/DeviceHostAvailability.tsx:16`（A，DeviceHostAvailability）
- 同一文本作为值用途字面量出现 2 次：`apps/server/src/ws.ts:672`（comparison）；`packages/contracts/src/baseSchemas.ts:317`（schema-literal）

### `Branch`（A，message，3 处）

- 显示位置（照常转换）：`apps/web/src/components/DiffPanel.tsx:765`（A，DiffPanel）；`apps/web/src/components/GitActionsControl.tsx:1966`（A，GitActionsControl）；`apps/web/src/components/chat/WorktreeSetupCard.tsx:262`（A，SetupDetails）
- 同一文本作为值用途字面量出现 1 次：`apps/web/src/components/chat/SubagentTooltipContent.tsx:101`（comparison）

### `Delete`（A，message，3 处）

- 显示位置（照常转换）：`apps/web/src/components/projectScriptEditor.tsx:443`（A，ProjectScriptEditorDialog）；`apps/web/src/components/settings/AcpSessionManagementSection.tsx:398`（A，AcpSessionManagementSection）；`apps/web/src/components/settings/ScheduledTasksSettings.tsx:501`（A，ScheduledTaskRow）
- 同一文本作为值用途字面量出现 6 次：`apps/desktop/src/preview/PreviewKeyboard.ts:56`（object-key）；`apps/desktop/src/preview/RecordingInput.ts:32`（object-key）；`apps/web/src/components/projectScriptEditor.tsx:214`（comparison）；`apps/web/src/terminal/ghostty/keyCodes.ts:73`（as-const）；`packages/client-runtime/src/device/stream.ts:303`（object-key）；`packages/client-runtime/src/device/stream.ts:333`（object-key）

### `Nightly`（A，message，3 处）

- 显示位置（照常转换）：`apps/web/src/components/settings/SettingsPanels.tsx:466`（A，AboutVersionSection）；`apps/web/src/components/settings/SettingsPanels.tsx:474`（A，AboutVersionSection）；`apps/web/src/components/settings/SettingsPanels.tsx:502`（A，AboutVersionSection）
- 同一文本作为值用途字面量出现 3 次：`apps/web/src/components/SidebarStageBackdrop.tsx:9`（ts-type）；`packages/contracts/src/ipc.ts:93`（ts-type）；`packages/contracts/src/ipc.ts:108`（schema-literal）

### `Process`（A，message，3 处）

- 显示位置（照常转换）：`apps/web/src/components/settings/DiagnosticsSettings.tsx:587`（A，ProcessResourceHistoryTable）；`apps/web/src/components/settings/ResourceTelemetryDiagnostics.tsx:590`（A，ProcessTable）；`apps/web/src/components/settings/ResourceTelemetryDiagnostics.tsx:693`（A，HistoryProcessTable）
- 同一文本作为值用途字面量出现 2 次：`apps/desktop/src/preview/RecordingInput.ts:21`（membership）；`apps/web/src/terminal/ghostty/surface.ts:420`（comparison）

### `Project`（B，message，3 处）

- 显示位置（照常转换）：`apps/web/src/components/pullRequest/PullRequestListFilters.tsx:583`（B，PullRequestFiltersMenu）；`apps/web/src/components/settings/ProjectSettingsPanel.tsx:418`（B，ProjectDetail）；`apps/web/src/components/settings/ScheduledTasksSettings.tsx:1022`（B，ScheduledTaskEditorDialog）
- 同一文本作为值用途字面量出现 1 次：`apps/web/src/components/settings/KeybindingsSettings.logic.ts:48`（ts-type）

### `Active`（B，message，2 处）

- 显示位置（照常转换）：`apps/web/src/components/Sidebar.tsx:5276`（B，Sidebar）；`apps/web/src/components/Sidebar.tsx:5287`（B，Sidebar）
- 同一文本作为值用途字面量出现 5 次：`apps/desktop/src/backend/DesktopBackendPool.ts:186`（ts-type）；`apps/desktop/src/backend/DesktopBackendPool.ts:328`（comparison）；`apps/desktop/src/backend/DesktopBackendPool.ts:429`（comparison）；`apps/desktop/src/backend/DesktopBackendPool.ts:435`（comparison）；`apps/web/src/components/settings/ResourceTelemetryDiagnostics.tsx:1121`（never-attribute）

### `Backspace`（A，message，2 处）

- 显示位置（照常转换）：`apps/web/src/components/CommandPaletteContent.tsx:86`（A，CommandPaletteContent）；`apps/web/src/components/projectScriptEditor.tsx:374`（A，ProjectScriptEditorDialog）
- 同一文本作为值用途字面量出现 8 次：`apps/desktop/src/preview/PreviewKeyboard.ts:38`（object-key）；`apps/desktop/src/preview/RecordingInput.ts:31`（object-key）；`apps/web/src/components/CommandPalette.tsx:3102`（comparison）；`apps/web/src/components/chat/ComposerStashMenu.tsx:104`（comparison）；`apps/web/src/components/projectScriptEditor.tsx:214`（comparison）；`apps/web/src/terminal/ghostty/keyCodes.ts:58`（as-const）；`packages/client-runtime/src/device/stream.ts:289`（object-key）；`packages/client-runtime/src/device/stream.ts:332`（object-key）

### `Browser`（B，message，2 处）

- 显示位置（照常转换）：`apps/web/src/components/settings/IntegrationsSettings.tsx:1457`（B，IntegrationsSettingsPanel）；`apps/web/src/components/settings/ProjectDefaultsSettings.tsx:264`（B，ProjectDefaultsSettings）
- 同一文本作为值用途字面量出现 6 次：`apps/server/src/provider/CodexToolPresentation.ts:182`（comparison）；`apps/server/src/resourceTelemetry/Model.ts:104`（switch-case）；`apps/web/src/components/RightPanelTabs.tsx:513`（comparison）；`apps/web/src/components/RightPanelTabs.tsx:525`（comparison）；`apps/web/src/components/RightPanelTabs.tsx:1244`（comparison）；`packages/contracts/src/resourceTelemetry.ts:232`（schema-literal）

### `Connect`（A，message，2 处）

- 显示位置（照常转换）：`apps/web/src/components/settings/CodexSetupSection.tsx:691`（A，ManagedCodexSetup）；`apps/web/src/components/settings/ProviderAuthenticationSection.tsx:422`（A，ProviderAuthenticationSection）
- 同一文本作为值用途字面量出现 1 次：`apps/web/src/components/onboarding/WelcomeWizard.tsx:105`（as-const）

### `Custom`（A，message，2 处）

- 显示位置（照常转换）：`apps/web/src/components/settings/StorageSettings.tsx:186`（A，StorageSettingsPanel）；`apps/web/src/components/settings/StorageSettings.tsx:192`（A，StorageSettingsPanel）
- 同一文本作为值用途字面量出现 2 次：`apps/web/src/components/settings/KeybindingsSettings.logic.ts:48`（ts-type）；`apps/web/src/components/settings/KeybindingsSettings.tsx:926`（comparison）

### `Devices`（B，message，2 处）

- 显示位置（照常转换）：`apps/web/src/components/settings/IntegrationsSettings.tsx:616`（B，DeviceIntegrationSettings）；`apps/web/src/components/settings/ProviderSettingsPanel.tsx:374`（B，ProviderSettingsPanelContent）
- 同一文本作为值用途字面量出现 1 次：`apps/web/src/components/device/DevicePanel.tsx:217`（never-attribute）

### `Disabled`（A，message，2 处）

- 显示位置（照常转换）：`apps/web/src/components/onboarding/WelcomeWizard.tsx:960`（A，AgentCard）；`apps/web/src/components/settings/AcpSessionManagementSection.tsx:490`（A，AcpSessionManagementSection）
- 同一文本作为值用途字面量出现 1 次：`apps/web/src/components/settings/ResourceTelemetryDiagnostics.tsx:1114`（never-attribute）

### `Files`（A，message，2 处）

- 显示位置（照常转换）：`apps/web/src/components/GitActionsControl.tsx:1988`（A，GitActionsControl）；`apps/web/src/components/diffs/DiffFileTree.tsx:173`（A，DiffFileTree）
- 同一文本作为值用途字面量出现 1 次：`apps/web/src/components/chat/workspaceFileDrop.ts:26`（membership）

### `Host`（B，message，2 处）

- 显示位置（照常转换）：`apps/web/src/components/pullRequest/PullRequestListFilters.tsx:561`（B，PullRequestFiltersMenu）；`apps/web/src/components/settings/ConnectionsSettings.tsx:2790`（A，renderRemoteFields）
- 同一文本作为值用途字面量出现 1 次：`apps/web/src/components/chat/ComposerSurface.tsx:101`（object-key）

### `Local ACP command`（A，message，2 处）

- 显示位置（照常转换）：`apps/web/src/components/settings/AcpRegistrySearchStep.tsx:182`（A，AcpRegistrySearchStep）；`apps/web/src/components/settings/AddProviderInstanceDialog.tsx:478`（A，AddProviderInstanceDialog）
- 同一文本作为值用途字面量出现 1 次：`apps/web/src/components/settings/AddProviderInstanceDialog.tsx:192`（as-const）

### `New thread`（A，message，2 处）

- 显示位置（照常转换）：`apps/web/src/components/LegacySidebar.tsx:2471`（A，SidebarProjectItem）；`apps/web/src/components/sidebar/SidebarThreadHeader.tsx:136`（B，SidebarThreadHeader）
- 同一文本作为值用途字面量出现 1 次：`apps/server/src/orchestration-v2/ThreadTitleRegenerationService.ts:118`（comparison）

### `Provider`（A，message，2 处）

- 显示位置（照常转换）：`apps/web/src/components/GitActionsControl.tsx:731`（A，PublishRepositoryDialog）；`apps/web/src/components/settings/AddProviderInstanceDialog.tsx:419`（A，AddProviderInstanceDialog）
- 同一文本作为值用途字面量出现 4 次：`apps/web/src/components/GitActionsControl.tsx:625`（as-const）；`apps/web/src/components/settings/AddProviderInstanceDialog.logic.ts:8`（as-const）；`apps/web/src/components/settings/AddProviderInstanceDialog.logic.ts:9`（as-const）；`apps/web/src/components/settings/AddProviderInstanceDialog.logic.ts:10`（as-const）

### `Read`（B，message，2 处）

- 显示位置（照常转换）：`apps/web/src/components/settings/ResourceTelemetryDiagnostics.tsx:295`（B，AggregateCard）；`apps/web/src/components/settings/ResourceTelemetryDiagnostics.tsx:698`（A，HistoryProcessTable）
- 同一文本作为值用途字面量出现 1 次：`apps/server/src/orchestration-v2/Adapters/ClaudeAdapterV2.ts:286`（as-const）

### `Repository`（A，message，2 处）

- 显示位置（照常转换）：`apps/web/src/components/CommandPalette.tsx:3479`（A，OpenCommandPaletteDialog）；`apps/web/src/components/GitActionsControl.tsx:808`（A，PublishRepositoryDialog）
- 同一文本作为值用途字面量出现 4 次：`apps/server/src/project/AgentSessionScanner.ts:700`（ts-type）；`apps/server/src/project/AgentSessionScanner.ts:722`（as-const）；`apps/server/src/project/AgentSessionScanner.ts:1246`（comparison）；`apps/web/src/components/GitActionsControl.tsx:625`（as-const）

### `Settled`（B，message，2 处）

- 显示位置（照常转换）：`apps/web/src/components/Sidebar.tsx:5346`（B，Sidebar）；`apps/web/src/components/Sidebar.tsx:5363`（B，Sidebar）
- 同一文本作为值用途字面量出现 1 次：`apps/web/src/hooks/showThreadUndoNotice.ts:12`（ts-type）

### `Skill`（A，message，2 处）

- 显示位置（照常转换）：`apps/web/src/components/chat/ComposerCommandMenu.tsx:271`（A，SkillSourceBadge）；`apps/web/src/components/chat/MessagesTimeline.tsx:4125`（B，userMessageContextPresentationRegistry）
- 同一文本作为值用途字面量出现 1 次：`packages/shared/src/toolActivity.ts:22`（comparison）

### `Stop`（A，message，2 处）

- 显示位置（照常转换）：`apps/web/src/components/ChatView.tsx:7317`（A，backgroundWorkBannerItem）；`apps/web/src/components/preview/PreviewChromeRow.tsx:164`（B，PreviewChromeRow）
- 同一文本作为值用途字面量出现 2 次：`packages/effect-codex-app-server/src/_generated/schema.gen.ts:52065`（object-key）；`packages/effect-codex-app-server/src/_generated/schema.gen.ts:52089`（object-key）

### `T3 Code`（A，message，2 处）

- 显示位置（照常转换）：`apps/web/src/components/chat/MessagesTimeline.tsx:2505`（A，AssistantTimelineRow）；`apps/web/src/components/onboarding/WelcomeWizard.tsx:224`（B，WelcomeWizard）
- 同一文本作为值用途字面量出现 1 次：`apps/server/src/cloud/cliAuthHtml.ts:12`（as-const）

### `Version`（B，message，2 处）

- 显示位置（照常转换）：`apps/web/src/components/settings/ConnectionsSettings.tsx:3507`（B，ConnectionsSettings）；`apps/web/src/components/settings/SettingsPanels.tsx:272`（A，AboutVersionTitle）
- 同一文本作为值用途字面量出现 3 次：`apps/desktop/src/snapShot/LinuxSnapShot.ts:55`（object-key）；`apps/desktop/src/snapShot/LinuxSnapShot.ts:56`（object-key）；`apps/desktop/src/snapShot/NiriSnapShot.ts:45`（object-key）

### `Working`（A，message，2 处）

- 显示位置（照常转换）：`apps/web/src/components/CommandPalette.tsx:3329`（A，OpenCommandPaletteDialog）；`apps/web/src/components/Sidebar.tsx:5308`（B，Sidebar）
- 同一文本作为值用途字面量出现 2 次：`apps/web/src/components/Sidebar.logic.ts:622`（ts-type）；`apps/web/src/components/Sidebar.logic.ts:637`（object-key）

### `author`（A，message，2 处）

- 显示位置（照常转换）：`apps/web/src/components/pullRequest/PullRequestSummaryTab.tsx:417`（A，CommentGroup）；`apps/web/src/components/pullRequest/PullRequestTimelineTab.tsx:332`（A，ConversationGroup）
- 同一文本作为值用途字面量出现 102 次：`apps/server/src/orchestration-v2/PullRequestSyncReactor.ts:61`（object-key）；`apps/server/src/orchestration-v2/pullRequestWatch.ts:46`（ts-type）；`apps/server/src/pullRequest/AzureDevOpsPullRequestProvider.ts:129`（object-key）；`apps/server/src/pullRequest/AzureDevOpsPullRequestProvider.ts:340`（object-key）；`apps/server/src/pullRequest/BitbucketPullRequestProvider.ts:99`（object-key）；`apps/server/src/pullRequest/GitHubPullRequestCli.ts:1829`（object-key）；`apps/server/src/pullRequest/GitHubPullRequestProvider.ts:240`（object-key）；`apps/server/src/pullRequest/GitHubPullRequestProvider.ts:301`（object-key）；`apps/server/src/pullRequest/GitHubPullRequestProvider.ts:333`（object-key）；`apps/server/src/pullRequest/GitHubPullRequestProvider.ts:355`（object-key）；…（共 102 处）

### `authors`（A，message，2 处）

- 显示位置（照常转换）：`apps/web/src/components/pullRequest/PullRequestSummaryTab.tsx:417`（A，CommentGroup）；`apps/web/src/components/pullRequest/PullRequestTimelineTab.tsx:332`（A，ConversationGroup）
- 同一文本作为值用途字面量出现 14 次：`apps/server/src/provider/acp/AcpRegistrySupport.ts:136`（object-key）；`apps/server/src/provider/acp/AcpRegistrySupport.ts:1580`（object-key）；`apps/server/src/pullRequest/GitHubPullRequestProvider.ts:447`（object-key）；`apps/server/src/pullRequest/bitbucketPullRequestJson.ts:536`（object-key）；`apps/server/src/pullRequest/forgejoPullRequestJson.ts:204`（object-key）；`apps/server/src/pullRequest/gitHubPullRequestJson.ts:388`（object-key）；`apps/server/src/pullRequest/gitHubPullRequestJson.ts:566`（object-key）；`apps/server/src/pullRequest/gitHubPullRequestJson.ts:1291`（ts-type）；`apps/server/src/pullRequest/gitHubPullRequestJson.ts:1593`（object-key）；`apps/server/src/pullRequest/gitHubPullRequestJson.ts:2348`（object-key）；…（共 14 处）

### `comment`（A，message，2 处）

- 显示位置（照常转换）：`apps/web/src/components/pullRequest/PullRequestReviewAnnotation.tsx:229`（A，ReviewThreadCard）；`apps/web/src/components/pullRequest/PullRequestTimelineTab.tsx:329`（A，ConversationGroup）
- 同一文本作为值用途字面量出现 98 次：`apps/desktop/src/preview/PickPreload.ts:1383`（object-key）；`apps/desktop/src/preview/PickedElementPayload.ts:76`（computed-key）；`apps/server/src/pullRequest/AzureDevOpsPullRequestProvider.ts:61`（object-key）；`apps/server/src/pullRequest/AzureDevOpsPullRequestProvider.ts:87`（object-key）；`apps/server/src/pullRequest/AzureDevOpsPullRequestProvider.ts:107`（object-key）；`apps/server/src/pullRequest/AzureDevOpsPullRequestProvider.ts:633`（object-key）；`apps/server/src/pullRequest/BitbucketPullRequestApi.ts:272`（object-key）；`apps/server/src/pullRequest/BitbucketPullRequestApi.ts:847`（object-key）；`apps/server/src/pullRequest/BitbucketPullRequestProvider.ts:17`（object-key）；`apps/server/src/pullRequest/BitbucketPullRequestProvider.ts:33`（object-key）；…（共 98 处）

### `comments`（A，message，2 处）

- 显示位置（照常转换）：`apps/web/src/components/pullRequest/PullRequestReviewAnnotation.tsx:229`（A，ReviewThreadCard）；`apps/web/src/components/pullRequest/PullRequestTimelineTab.tsx:329`（A，ConversationGroup）
- 同一文本作为值用途字面量出现 80 次：`apps/server/src/orchestration-v2/PullRequestWatchReactor.ts:164`（object-key）；`apps/server/src/orchestration-v2/PullRequestWatchReactor.ts:249`（object-key）；`apps/server/src/pullRequest/AzureDevOpsPullRequestProvider.ts:396`（object-key）；`apps/server/src/pullRequest/AzureDevOpsPullRequestProvider.ts:404`（object-key）；`apps/server/src/pullRequest/AzureDevOpsPullRequestProvider.ts:405`（object-key）；`apps/server/src/pullRequest/AzureDevOpsPullRequestProvider.ts:409`（object-key）；`apps/server/src/pullRequest/BitbucketPullRequestApi.ts:224`（object-key）；`apps/server/src/pullRequest/BitbucketPullRequestApi.ts:290`（object-key）；`apps/server/src/pullRequest/BitbucketPullRequestApi.ts:492`（object-key）；`apps/server/src/pullRequest/BitbucketPullRequestApi.ts:496`（object-key）；…（共 80 处）

### `default`（A，message，2 处）

- 显示位置（照常转换）：`apps/web/src/components/settings/EnvironmentIconPicker.tsx:127`（A，EnvironmentIconMenu）；`apps/web/src/components/settings/FontFamilyPicker.tsx:187`（A，renderItem）
- 同一文本作为值用途字面量出现 504 次：`apps/desktop/src/ipc/methods/window.ts:163`（comparison）；`apps/desktop/src/snapShot/RegionSnapShotWorker.ts:9`（object-key）；`apps/server/src/device/DeviceActions.ts:103`（object-key）；`apps/server/src/device/DeviceActions.ts:109`（object-key）；`apps/server/src/mcp/OrchestratorMcpService.ts:902`（as-const）；`apps/server/src/mcp/ThreadMetadataMcpService.ts:176`（as-const）；`apps/server/src/mcp/threadAccess.ts:131`（comparison）；`apps/server/src/mcp/toolkits/project/handlers.ts:50`（comparison）；`apps/server/src/mcp/toolkits/pullRequests/handlers.ts:210`（as-const）；`apps/server/src/orchestration-v2/Adapters/AcpAdapterV2.ts:6237`（comparison）；…（共 504 处）

### `iOS`（A，message，2 处）

- 显示位置（照常转换）：`apps/web/src/components/RightPanelTabs.tsx:1407`（A，DeviceTabTooltip）；`apps/web/src/components/device/DeviceHostAvailability.tsx:16`（A，DeviceHostAvailability）
- 同一文本作为值用途字面量出现 2 次：`apps/server/src/ws.ts:672`（comparison）；`packages/contracts/src/baseSchemas.ts:316`（schema-literal）

### `on`（A，message，2 处）

- 显示位置（照常转换）：`apps/web/src/components/settings/ScheduledTasksSettings.tsx:1282`（A，ScheduledTaskEditorDialog）；`apps/web/src/components/settings/SettingsScopeSentence.tsx:75`（A，SettingsScopeSentence）
- 同一文本作为值用途字面量出现 25 次：`apps/desktop/src/app/DesktopLifecycle.ts:69`（object-key）；`apps/desktop/src/electron/ElectronApp.ts:79`（object-key）；`apps/desktop/src/electron/ElectronApp.ts:208`（object-key）；`apps/desktop/src/electron/ElectronUpdater.ts:76`（object-key）；`apps/desktop/src/electron/ElectronUpdater.ts:154`（object-key）；`apps/desktop/src/electron/ElectronUpdater.ts:156`（object-key）；`apps/desktop/src/ipc/DesktopIpc.ts:26`（object-key）；`apps/desktop/src/snapShot/snapShot.ts:134`（ts-type）；`apps/desktop/src/snapShot/snapShot.ts:234`（comparison）；`apps/desktop/src/updates/updatesTestHarness.ts:100`（object-key）；…（共 25 处）

### `value`（B，message，2 处）

- 显示位置（照常转换）：`apps/web/src/components/settings/CustomModelEditor.tsx:156`（B，renderChoice）；`apps/web/src/components/settings/ProviderInstanceCard.tsx:417`（B，ProviderEnvironmentSection）
- 同一文本作为值用途字面量出现 809 次：`apps/desktop/src/app/DesktopObservability.ts:113`（object-key）；`apps/desktop/src/app/DesktopObservability.ts:249`（object-key）；`apps/desktop/src/app/DesktopObservability.ts:255`（object-key）；`apps/desktop/src/app/chromiumLocalStorage.ts:269`（object-key）；`apps/desktop/src/app/chromiumLocalStorage.ts:293`（object-key）；`apps/desktop/src/app/chromiumLocalStorage.ts:295`（object-key）；`apps/desktop/src/app/chromiumLocalStorage.ts:353`（object-key）；`apps/desktop/src/preview/BrowserImport/BrowserImport.ts:130`（object-key）；`apps/desktop/src/preview/BrowserImport/ChromiumCookies.ts:82`（object-key）；`apps/desktop/src/preview/BrowserImport/ChromiumCookies.ts:98`（object-key）；…（共 809 处）

### `Add ChatGPT account`（B，message，1 处）

- 显示位置（照常转换）：`apps/web/src/components/settings/AddCodexAccountDialog.tsx:90`（B，AddCodexAccountDialog）
- 同一文本作为值用途字面量出现 1 次：`apps/web/src/components/settings/AddCodexAccountDialog.tsx:36`（non-display-call）

### `Alt`（A，message，1 处）

- 显示位置（照常转换）：`apps/web/src/components/settings/KeybindingsSettings.tsx:95`（A，KeybindingPill）
- 同一文本作为值用途字面量出现 11 次：`apps/desktop/src/preview/Manager.ts:4376`（membership）；`apps/desktop/src/preview/PreviewKeyboard.ts:43`（object-key）；`apps/desktop/src/preview/PreviewKeyboard.ts:105`（as-const）；`apps/desktop/src/preview/PreviewKeyboard.ts:122`（switch-case）；`apps/desktop/src/preview/PreviewKeyboard.ts:255`（membership）；`apps/desktop/src/preview/RecordingInput.ts:24`（comparison）；`apps/desktop/src/preview/RecordingInput.ts:41`（membership）；`apps/web/src/components/ComposerPromptEditorTiptap.tsx:1364`（comparison）；`apps/web/src/components/settings/useSnapShotShortcutRecorder.tsx:23`（object-key）；`apps/web/src/shortcutModifierState.ts:86`（switch-case）；…（共 11 处）

### `Any`（A，message，1 处）

- 显示位置（照常转换）：`apps/web/src/components/pullRequest/PullRequestListFilters.tsx:345`（A，PullRequestLabelFilter）
- 同一文本作为值用途字面量出现 1 次：`apps/server/src/project/AgentSessionJson.ts:34`（switch-case）

### `App`（B，message，1 处）

- 显示位置（照常转换）：`apps/web/src/components/device/DeviceToolsPanel.tsx:134`（B，DeviceToolsPanel）
- 同一文本作为值用途字面量出现 6 次：`apps/desktop/src/electron/WindowsForegroundFocusWorker.ts:29`（ts-type）；`apps/desktop/src/electron/WindowsForegroundFocusWorker.ts:47`（ts-type）；`apps/desktop/src/electron/WindowsForegroundFocusWorker.ts:60`（ts-type）；`apps/desktop/src/electron/WindowsForegroundFocusWorker.ts:79`（object-key）；`apps/desktop/src/snapShot/SnapShotAccessibility.ts:39`（ts-type）；`apps/desktop/src/snapShot/SnapShotAccessibilityWorker.ts:9`（object-key）

### `Attachment`（A，message，1 处）

- 显示位置（照常转换）：`apps/web/src/components/files/AttachmentFilePreview.tsx:291`（A，AttachmentFilePreview）
- 同一文本作为值用途字面量出现 1 次：`apps/web/src/components/chat/ComposerBanner.tsx:344`（object-key）

### `Body`（B，message，1 处）

- 显示位置（照常转换）：`apps/web/src/components/settings/ScheduledTasksSettings.tsx:593`（B，WebhookDeliveriesDialog）
- 同一文本作为值用途字面量出现 1 次：`apps/web/src/components/chat/ComposerBanner.tsx:356`（object-key）

### `Commit`（A，message，1 处）

- 显示位置（照常转换）：`apps/web/src/components/GitActionsControl.tsx:2111`（A，GitActionsControl）
- 同一文本作为值用途字面量出现 1 次：`apps/web/src/components/GitActionsControl.tsx:385`（comparison）

### `Copy`（A，message，1 处）

- 显示位置（照常转换）：`apps/web/src/components/settings/ScheduledTasksSettings.tsx:722`（A，WebhookEndpointField）
- 同一文本作为值用途字面量出现 1 次：`apps/web/src/terminal/ghostty/keyCodes.ts:178`（as-const）

### `Count`（A，message，1 处）

- 显示位置（照常转换）：`apps/web/src/components/settings/ResourceTelemetryDiagnostics.tsx:779`（A，AttributionTable）
- 同一文本作为值用途字面量出现 1 次：`apps/web/src/components/chat/ComposerBanner.tsx:355`（object-key）

### `Cursor`（A，message，1 处）

- 显示位置（照常转换）：`apps/web/src/components/usage/UsagePage.tsx:987`（A，CursorEnableLimits）
- 同一文本作为值用途字面量出现 2 次：`apps/server/src/provider/Layers/CursorProvider.ts:27`（as-const）；`apps/server/src/provider/cursorSdk.ts:74`（object-key）

### `Desktop`（B，message，1 处）

- 显示位置（照常转换）：`apps/web/src/components/settings/ResourceTelemetryDiagnostics.tsx:1067`（B，ResourceTelemetryDiagnostics）
- 同一文本作为值用途字面量出现 1 次：`packages/shared/src/previewViewport.ts:11`（ts-type）

### `Device hub`（B，message，1 处）

- 显示位置（照常转换）：`apps/web/src/components/settings/IntegrationsSettings.tsx:776`（B，DeviceIntegrationControls）
- 同一文本作为值用途字面量出现 2 次：`apps/web/src/components/device/DeviceToolVersions.tsx:54`（as-const）；`packages/client-runtime/src/state/device.ts:79`（as-const）

### `Dismiss`（A，message，1 处）

- 显示位置（照常转换）：`apps/web/src/components/desktop/SshPasswordPromptDialog.tsx:212`（A，ActiveSshPasswordPrompt）
- 同一文本作为值用途字面量出现 1 次：`apps/web/src/components/chat/ComposerBanner.tsx:359`（object-key）

### `Enabled`（A，message，1 处）

- 显示位置（照常转换）：`apps/web/src/components/settings/ScheduledTasksSettings.tsx:1327`（A，ScheduledTaskEditorDialog）
- 同一文本作为值用途字面量出现 1 次：`apps/web/src/components/settings/ResourceTelemetryDiagnostics.tsx:1113`（never-attribute）

### `Encoding`（B，message，1 处）

- 显示位置（照常转换）：`apps/web/src/components/settings/ScheduledTasksSettings.tsx:1227`（B，ScheduledTaskEditorDialog）
- 同一文本作为值用途字面量出现 7 次：`apps/server/src/persistence/Errors.ts:8`（switch-case）；`packages/effect-acp/src/errors.ts:21`（schema-literal）；`packages/effect-acp/src/errors.ts:51`（switch-case）；`packages/effect-codex-app-server/src/errors.ts:14`（schema-literal）；`packages/effect-codex-app-server/src/errors.ts:44`（switch-case）；`packages/shared/src/schemaJson.ts:57`（switch-case）；`packages/shared/src/schemaJson.ts:78`（switch-case）

### `Environment disconnected`（B，message，1 处）

- 显示位置（照常转换）：`apps/web/src/components/settings/ScheduledTasksSettings.tsx:361`（B，ScheduledTaskEnvironmentSection）
- 同一文本作为值用途字面量出现 3 次：`apps/web/src/components/settings/DeviceHostsSettings.tsx:43`（error-constructor）；`apps/web/src/components/settings/IntegrationsSettings.tsx:674`（error-constructor）；`apps/web/src/components/settings/deviceHostConnectionChecks.ts:49`（error-constructor）

### `Failed`（A，message，1 处）

- 显示位置（照常转换）：`apps/web/src/components/settings/DeviceHostEditor.tsx:184`（A，DeviceHostEditor）
- 同一文本作为值用途字面量出现 11 次：`apps/desktop/src/backend/DesktopBackendConfiguration.ts:295`（ts-type）；`apps/desktop/src/backend/DesktopBackendConfiguration.ts:340`（as-const）；`apps/desktop/src/backend/DesktopBackendConfiguration.ts:352`（as-const）；`apps/desktop/src/backend/DesktopBackendConfiguration.ts:366`（as-const）；`apps/desktop/src/backend/DesktopBackendConfiguration.ts:382`（as-const）；`apps/desktop/src/backend/DesktopBackendConfiguration.ts:425`（as-const）；`apps/desktop/src/backend/DesktopBackendConfiguration.ts:464`（as-const）；`apps/desktop/src/backend/DesktopBackendConfiguration.ts:771`（comparison）；`apps/server/src/orchestration-v2/Adapters/AcpAdapterV2.ts:1224`（ts-type）；`apps/server/src/orchestration-v2/Adapters/AcpAdapterV2.ts:1720`（comparison）；…（共 11 处）

### `HEAD`（A，message，1 处）

- 显示位置（照常转换）：`apps/web/src/components/DiffPanel.tsx:725`（A，DiffPanel）
- 同一文本作为值用途字面量出现 15 次：`apps/desktop/src/electron/ElectronProtocol.ts:187`（comparison）；`apps/desktop/src/electron/ElectronProtocol.ts:192`（comparison）；`apps/desktop/src/electron/ElectronProtocol.ts:211`（comparison）；`apps/desktop/src/electron/ElectronProtocol.ts:234`（comparison）；`apps/server/src/device/DeviceHubProxy.ts:167`（comparison）；`apps/server/src/device/DeviceHubProxy.ts:202`（comparison）；`apps/server/src/http.ts:171`（ts-type）；`apps/server/src/http.ts:218`（comparison）；`apps/server/src/http.ts:440`（comparison）；`apps/server/src/storageCleanup.ts:344`（comparison）；…（共 15 处）

### `Home`（B，message，1 处）

- 显示位置（照常转换）：`apps/web/src/components/device/DeviceControlsRail.tsx:65`（B，DeviceControlsRail）
- 同一文本作为值用途字面量出现 14 次：`apps/desktop/src/preview/PreviewKeyboard.ts:50`（object-key）；`apps/web/src/components/ChatView.tsx:6348`（membership）；`apps/web/src/components/ChatView.tsx:6350`（membership）；`apps/web/src/components/ChatView.tsx:6358`（switch-case）；`apps/web/src/components/ComposerPromptEditorTiptap.tsx:876`（comparison）；`apps/web/src/components/ComposerPromptEditorTiptap.tsx:892`（comparison）；`apps/web/src/components/chat/MessagesTimeline.tsx:840`（membership）；`apps/web/src/components/chat/MessagesTimeline.tsx:1598`（comparison）；`apps/web/src/components/chat/composerScrollGesture.ts:16`（switch-case）；`apps/web/src/components/chat/useAssistantCitationTarget.ts:158`（membership）；…（共 14 处）

### `Icon`（A，message，1 处）

- 显示位置（照常转换）：`apps/web/src/components/settings/EnvironmentIconPicker.tsx:100`（A，EnvironmentIconMenu）
- 同一文本作为值用途字面量出现 120 次：`apps/web/src/components/ChatMarkdown.tsx:525`（object-key）；`apps/web/src/components/ChatMarkdown.tsx:529`（object-key）；`apps/web/src/components/ChatMarkdown.tsx:535`（object-key）；`apps/web/src/components/ChatMarkdown.tsx:541`（object-key）；`apps/web/src/components/ChatMarkdown.tsx:547`（object-key）；`apps/web/src/components/ChatMarkdown.tsx:553`（object-key）；`apps/web/src/components/GitActionsControl.tsx:203`（object-key）；`apps/web/src/components/GitActionsControl.tsx:211`（object-key）；`apps/web/src/components/GitActionsControl.tsx:219`（object-key）；`apps/web/src/components/GitActionsControl.tsx:227`（object-key）；…（共 120 处）

### `Idle`（B，message，1 处）

- 显示位置（照常转换）：`apps/web/src/components/settings/ResourceTelemetryDiagnostics.tsx:1118`（B，ResourceTelemetryDiagnostics）
- 同一文本作为值用途字面量出现 29 次：`apps/desktop/src/preview/Manager.ts:98`（ts-type）；`apps/desktop/src/preview/Manager.ts:1846`（comparison）；`apps/desktop/src/preview/Manager.ts:2520`（comparison）；`apps/desktop/src/preview/Manager.ts:3772`（comparison）；`apps/desktop/src/preview/Manager.ts:3773`（comparison）；`apps/server/src/orchestration-v2/Adapters/AcpAdapterV2.ts:1219`（ts-type）；`apps/server/src/orchestration-v2/Adapters/AcpAdapterV2.ts:1730`（comparison）；`apps/server/src/orchestration-v2/Adapters/AcpAdapterV2.ts:7239`（comparison）；`apps/server/src/preview/Manager.ts:281`（comparison）；`apps/web/src/browser/ElectronBrowserHost.tsx:86`（comparison）；…（共 29 处）

### `Interrupt`（A，message，1 处）

- 显示位置（照常转换）：`apps/web/src/components/chat/ComposerPrimaryActions.tsx:143`（A，renderStopGenerationButton）
- 同一文本作为值用途字面量出现 5 次：`packages/effect-acp/src/protocol.ts:250`（comparison）；`packages/effect-acp/src/protocol.ts:626`（switch-case）；`packages/effect-codex-app-server/src/_generated/schema.gen.ts:52057`（object-key）；`packages/effect-codex-app-server/src/_generated/schema.gen.ts:52073`（object-key）；`packages/shared/src/schemaJson.ts:139`（switch-case）

### `Mode`（A，message，1 处）

- 显示位置（照常转换）：`apps/web/src/components/chat/CompactComposerControlsMenu.tsx:64`（A，CompactComposerControlsMenu）
- 同一文本作为值用途字面量出现 1 次：`packages/shared/src/qrCode.ts:763`（object-key）

### `Path`（A，message，1 处）

- 显示位置（照常转换）：`apps/web/src/components/chat/WorktreeSetupCard.tsx:278`（A，SetupDetails）
- 同一文本作为值用途字面量出现 3 次：`apps/server/src/cli/update.ts:204`（computed-key）；`apps/server/src/process/externalLauncher.ts:117`（object-key）；`apps/server/src/provider/providerMaintenance.ts:52`（object-key）

### `Projects`（A，message，1 处）

- 显示位置（照常转换）：`apps/web/src/components/LegacySidebar.tsx:3025`（A，SidebarProjectsContent）
- 同一文本作为值用途字面量出现 1 次：`apps/web/src/components/onboarding/WelcomeWizard.tsx:105`（as-const）

### `Remove route`（A，message，1 处）

- 显示位置（照常转换）：`apps/web/src/components/settings/EnvironmentRoutesList.tsx:217`（A，SortableRouteRow）
- 同一文本作为值用途字面量出现 1 次：`apps/web/src/components/settings/EnvironmentRoutesList.tsx:71`（non-display-call）

### `Skipped`（A，message，1 处）

- 显示位置（照常转换）：`apps/web/src/components/settings/BrowserImportWizard.tsx:568`（A，DoneStep）
- 同一文本作为值用途字面量出现 2 次：`apps/server/src/project/AgentSessionImporter.ts:221`（comparison）；`apps/server/src/project/AgentSessionScanner.ts:179`（ts-type）

### `Snoozed`（B，message，1 处）

- 显示位置（照常转换）：`apps/web/src/components/Sidebar.tsx:5326`（B，Sidebar）
- 同一文本作为值用途字面量出现 1 次：`apps/web/src/hooks/showThreadUndoNotice.ts:12`（ts-type）

### `Type`（A，message，1 处）

- 显示位置（照常转换）：`apps/web/src/components/settings/DiagnosticsSettings.tsx:366`（A，ProcessDiagnosticsTable）
- 同一文本作为值用途字面量出现 21 次：`apps/server/src/sourceControl/AzureDevOpsCli.ts:338`（ts-type）；`apps/server/src/sourceControl/BitbucketApi.ts:692`（ts-type）；`apps/server/src/sourceControl/BitbucketApi.ts:712`（ts-type）；`apps/server/src/textGeneration/ClaudeTextGeneration.ts:140`（ts-type）；`apps/server/src/textGeneration/CodexTextGeneration.ts:192`（ts-type）；`apps/server/src/textGeneration/CursorTextGeneration.ts:117`（ts-type）；`apps/server/src/textGeneration/GrokTextGeneration.ts:62`（ts-type）；`apps/server/src/textGeneration/OpenCodeTextGeneration.ts:373`（ts-type）；`apps/server/src/textGeneration/PiTextGeneration.ts:61`（ts-type）；`packages/contracts/src/baseSchemas.ts:127`（ts-type）；…（共 21 处）

### `Unknown`（A，message，1 处）

- 显示位置（照常转换）：`apps/web/src/components/device/DeviceToolsPanel.tsx:394`（A，ChoiceSelect）
- 同一文本作为值用途字面量出现 5 次：`apps/server/src/project/AgentSessionJson.ts:33`（switch-case）；`apps/server/src/provider/Drivers/CodexHomeLayout.ts:149`（comparison）；`apps/web/src/components/settings/ResourceTelemetryDiagnostics.tsx:1047`（never-attribute）；`packages/contracts/src/resourceTelemetry.ts:240`（schema-literal）；`packages/shared/src/symlink.ts:43`（error-constructor）

### `Worktree`（A，message，1 处）

- 显示位置（照常转换）：`apps/web/src/components/PullRequestThreadDialog.tsx:301`（A，PullRequestThreadDialog）
- 同一文本作为值用途字面量出现 3 次：`apps/server/src/project/AgentSessionScanner.ts:701`（ts-type）；`apps/server/src/project/AgentSessionScanner.ts:715`（as-const）；`apps/server/src/project/AgentSessionScanner.ts:1242`（comparison）

### `and`（A，message，1 处）

- 显示位置（照常转换）：`apps/web/src/components/settings/KeybindingsSettings.tsx:535`（A，WhenExpressionNodeEditor）
- 同一文本作为值用途字面量出现 13 次：`apps/server/src/keybindings.ts:185`（switch-case）；`apps/web/src/components/settings/KeybindingsSettings.logic.ts:103`（switch-case）；`apps/web/src/components/settings/KeybindingsSettings.logic.ts:270`（switch-case）；`apps/web/src/components/settings/KeybindingsSettings.tsx:175`（ts-type）；`apps/web/src/components/settings/KeybindingsSettings.tsx:512`（comparison）；`apps/web/src/components/settings/KeybindingsSettings.tsx:535`（never-attribute）；`apps/web/src/keybindings.ts:169`（switch-case）；`packages/client-runtime/src/work-log/commandLabel.ts:76`（membership）；`packages/client-runtime/src/work-log/commandLabel.ts:166`（membership）；`packages/contracts/src/keybindings.ts:172`（schema-literal）；…（共 13 处）

### `approval`（A，message，1 处）

- 显示位置（照常转换）：`apps/web/src/components/pullRequest/PullRequestDetailPanel.tsx:2628`（A，PullRequestDetailPanel）
- 同一文本作为值用途字面量出现 20 次：`apps/server/src/orchestration-v2/Adapters/AcpAdapterV2.ts:1446`（ts-type）；`apps/server/src/orchestration-v2/Adapters/AcpAdapterV2.ts:5023`（comparison）；`apps/server/src/orchestration-v2/Adapters/AcpAdapterV2.ts:7215`（comparison）；`apps/server/src/orchestration-v2/Adapters/ClaudeAdapterV2.ts:2882`（ts-type）；`apps/server/src/orchestration-v2/Adapters/CodexAdapterV2.ts:1214`（ts-type）；`apps/web/src/components/Sidebar.logic.ts:949`（ts-type）；`apps/web/src/components/Sidebar.logic.ts:966`（comparison）；`apps/web/src/components/Sidebar.logic.ts:1000`（ts-type）；`apps/web/src/components/Sidebar.logic.ts:1020`（comparison）；`apps/web/src/components/Sidebar.tsx:1231`（comparison）；…（共 20 处）

### `approvals`（A，message，1 处）

- 显示位置（照常转换）：`apps/web/src/components/pullRequest/PullRequestDetailPanel.tsx:2628`（A，PullRequestDetailPanel）
- 同一文本作为值用途字面量出现 12 次：`apps/server/src/orchestration-v2/Adapters/AcpAdapterV2.ts:582`（object-key）；`apps/server/src/orchestration-v2/Adapters/ClaudeAdapterV2.ts:222`（object-key）；`apps/server/src/orchestration-v2/Adapters/CodexAdapterV2.ts:281`（object-key）；`apps/server/src/orchestration-v2/Adapters/CursorAdapterV2.ts:126`（object-key）；`apps/server/src/orchestration-v2/Adapters/OpenCode2AdapterV2.ts:146`（object-key）；`apps/server/src/orchestration-v2/Adapters/OpenCodeAdapterV2.ts:166`（object-key）；`apps/server/src/orchestration-v2/Adapters/PiAdapterV2.ts:164`（object-key）；`apps/web/src/components/ChatView.tsx:3220`（object-key）；`apps/web/src/components/clerk/MobileClientsUserProfilePage.logic.ts:9`（as-const）；`packages/client-runtime/src/state/threadRequests.ts:40`（object-key）；…（共 12 处）

### `auto-settle`（B，message，1 处）

- 显示位置（照常转换）：`apps/web/src/components/settings/SettingsPanels.tsx:2434`（B，GeneralSettingsPanel）
- 同一文本作为值用途字面量出现 2 次：`apps/web/src/components/threadActionMenu.logic.ts:17`（ts-type）；`apps/web/src/components/threadActionMenu.logic.ts:187`（as-const）

### `available`（A，message，1 处）

- 显示位置（照常转换）：`apps/web/src/components/device/DeviceHostAvailability.tsx:17`（A，DeviceHostAvailability）
- 同一文本作为值用途字面量出现 106 次：`apps/desktop/src/ipc/methods/wsl.ts:32`（object-key）；`apps/desktop/src/preview/Manager.ts:3769`（object-key）；`apps/desktop/src/preview/Manager.ts:3780`（object-key）；`apps/desktop/src/preview/Manager.ts:3788`（object-key）；`apps/desktop/src/snapShot/DesktopSnapShot.ts:695`（object-key）；`apps/desktop/src/snapShot/DesktopSnapShot.ts:700`（object-key）；`apps/desktop/src/snapShot/DesktopSnapShot.ts:702`（object-key）；`apps/desktop/src/snapShot/DesktopSnapShot.ts:1014`（object-key）；`apps/desktop/src/snapShot/DesktopSnapShot.ts:1018`（object-key）；`apps/desktop/src/snapShot/DesktopSnapShot.ts:1024`（object-key）；…（共 106 处）

### `base64`（A，message，1 处）

- 显示位置（照常转换）：`apps/web/src/components/settings/ScheduledTasksSettings.tsx:1242`（A，ScheduledTaskEditorDialog）
- 同一文本作为值用途字面量出现 13 次：`apps/desktop/src/preview/FaviconCapture.ts:219`（comparison）；`apps/desktop/src/preview/FaviconCapture.ts:220`（membership）；`apps/desktop/src/preview/FaviconCapture.ts:227`（comparison）；`apps/server/src/htmlRender/HtmlRender.ts:295`（as-const）；`apps/server/src/imageMime.ts:56`（object-key）；`apps/server/src/imageMime.ts:76`（comparison）；`apps/server/src/imageMime.ts:113`（object-key）；`apps/server/src/pullRequest/ForgejoPullRequestProvider.ts:414`（schema-literal）；`apps/web/src/components/settings/ScheduledTasksSettings.tsx:1233`（comparison）；`apps/web/src/components/settings/ScheduledTasksSettings.tsx:1242`（never-attribute）；…（共 13 处）

### `binding`（A，message，1 处）

- 显示位置（照常转换）：`apps/web/src/components/settings/KeybindingsSettings.tsx:1495`（A，KeybindingsSettingsPanel）
- 同一文本作为值用途字面量出现 6 次：`apps/server/src/provider/CursorCredentialStore.ts:90`（object-key）；`apps/server/src/provider/ProviderCredentialStore.ts:16`（object-key）；`apps/server/src/provider/acp/AcpRegistryAuthenticationState.ts:17`（object-key）；`apps/server/src/provider/acp/AcpRegistryAuthenticationState.ts:63`（object-key）；`apps/web/src/components/settings/KeybindingsSettings.logic.ts:58`（object-key）；`apps/web/src/components/settings/KeybindingsSettings.logic.ts:221`（object-key）

### `cost`（A，message，1 处）

- 显示位置（照常转换）：`apps/web/src/components/usage/UsagePage.tsx:614`（A，UsagePage）
- 同一文本作为值用途字面量出现 29 次：`apps/server/src/provider/acp/AcpRuntimeModel.ts:1589`（object-key）；`apps/server/src/sourceControl/githubGraphQlBudget.ts:14`（object-key）；`apps/server/src/sourceControl/githubGraphQlBudget.ts:46`（object-key）；`apps/server/src/sourceControl/githubGraphQlBudget.ts:62`（object-key）；`apps/server/src/sourceControl/githubGraphQlBudget.ts:140`（object-key）；`apps/server/src/textGeneration/OpenCode2TextGeneration.fixture.ts:44`（object-key）；`apps/server/src/textGeneration/OpenCode2TextGeneration.fixture.ts:321`（object-key）；`apps/server/src/textGeneration/OpenCode2TextGeneration.fixture.ts:341`（object-key）；`apps/web/src/components/usage/UsagePage.tsx:507`（comparison）；`apps/web/src/components/usage/UsagePage.tsx:513`（comparison）；…（共 29 处）

### `custom`（A，message，1 处）

- 显示位置（照常转换）：`apps/web/src/components/settings/ProviderModelsSection.tsx:479`（A，renderRow）
- 同一文本作为值用途字面量出现 77 次：`apps/server/src/git/GitManager.ts:785`（switch-case）；`apps/server/src/orchestration-v2/ThreadLaunchService.ts:301`（comparison）；`apps/server/src/textGeneration/TextGenerationPolicy.ts:7`（schema-literal）；`apps/server/src/textGeneration/TextGenerationPrompts.ts:195`（comparison）；`apps/server/src/textGeneration/TextGenerationPrompts.ts:214`（comparison）；`apps/web/src/components/settings/BranchNamingSettings.tsx:19`（object-key）；`apps/web/src/components/settings/BranchNamingSettings.tsx:118`（comparison）；`apps/web/src/components/settings/SettingInheritance.tsx:34`（object-key）；`apps/web/src/components/settings/SettingsPanels.logic.ts:193`（comparison）；`apps/web/src/components/settings/SettingsPanels.logic.ts:205`（comparison）；…（共 77 处）

### `days`（A，message，1 处）

- 显示位置（照常转换）：`apps/web/src/components/settings/StorageSettings.tsx:68`（A，RetentionControl）
- 同一文本作为值用途字面量出现 24 次：`apps/server/src/auth/EnvironmentAuth.ts:728`（object-key）；`apps/server/src/scheduledTasks/Schedule.ts:30`（object-key）；`apps/web/src/components/CustomSnoozeDialog.tsx:64`（ts-type）；`apps/web/src/components/CustomSnoozeDialog.tsx:189`（object-key）；`apps/web/src/components/CustomSnoozeDialog.tsx:191`（comparison）；`apps/web/src/components/CustomSnoozeDialog.tsx:202`（never-attribute）；`apps/web/src/components/usage/UsageModelDialog.tsx:29`（object-key）；`apps/web/src/components/usage/UsagePage.tsx:125`（object-key）；`apps/web/src/components/usage/UsagePage.tsx:142`（object-key）；`apps/web/src/components/usage/UsagePage.tsx:222`（object-key）；…（共 24 处）

### `folder`（A，message，1 处）

- 显示位置（照常转换）：`apps/web/src/components/onboarding/WelcomeWizard.tsx:1523`（A，ImportCandidateList）
- 同一文本作为值用途字面量出现 10 次：`apps/server/src/project/ManagedProjectFolders.ts:45`（object-key）；`apps/server/src/project/ManagedProjectFolders.ts:71`（object-key）；`apps/server/src/project/ManagedProjectFolders.ts:280`（object-key）；`apps/server/src/project/ManagedProjectFolders.ts:367`（object-key）；`apps/server/src/project/ManagedProjectFolders.ts:369`（object-key）；`apps/server/src/project/ManagedProjectFolders.ts:385`（object-key）；`apps/server/src/project/ManagedProjectFolders.ts:401`（object-key）；`apps/server/src/project/ManagedProjectFolders.ts:405`（object-key）；`apps/server/src/project/ManagedProjectFolders.ts:464`（object-key）；`apps/web/src/contextMenuFallback.ts:40`（object-key）

### `folders`（A，message，1 处）

- 显示位置（照常转换）：`apps/web/src/components/onboarding/WelcomeWizard.tsx:1523`（A，ImportCandidateList）
- 同一文本作为值用途字面量出现 4 次：`apps/web/src/components/chat/workspaceFileDrop.ts:35`（object-key）；`apps/web/src/components/chat/workspaceFileDrop.ts:38`（object-key）；`apps/web/src/components/chat/workspaceFileDrop.ts:52`（object-key）；`apps/web/src/components/chat/workspaceFileDrop.ts:79`（object-key）

### `ghost`（A，message，1 处）

- 显示位置（照常转换）：`apps/web/src/components/pullRequest/PullRequestTimelineTab.tsx:93`（A，ActorName）
- 同一文本作为值用途字面量出现 12 次：`apps/web/src/components/chat/MessageCopyButton.tsx:25`（ts-type）；`apps/web/src/components/chat/MessageCopyButton.tsx:47`（comparison）；`apps/web/src/components/pullRequest/PullRequestSummaryTab.tsx:384`（never-attribute）；`apps/web/src/components/ui/button.tsx:48`（object-key）；`apps/web/src/components/ui/input-group.tsx:19`（object-key）；`apps/web/src/components/ui/menu.tsx:83`（ts-type）；`apps/web/src/components/ui/menu.tsx:89`（comparison）；`apps/web/src/components/ui/menu.tsx:91`（non-display-call）；`apps/web/src/components/ui/select.tsx:24`（object-key）；`apps/web/src/components/ui/toast.tsx:51`（ts-type）；…（共 12 处）

### `hex`（A，message，1 处）

- 显示位置（照常转换）：`apps/web/src/components/settings/ScheduledTasksSettings.tsx:1241`（A，ScheduledTaskEditorDialog）
- 同一文本作为值用途字面量出现 9 次：`apps/server/src/htmlRender/PreviewBrowser.ts:242`（comparison）；`apps/server/src/provider/AntigravityInstallation.ts:543`（comparison）；`apps/server/src/provider/CodexInstallation.ts:504`（comparison）；`apps/server/src/scheduledTasks/webhookVerification.ts:30`（comparison）；`apps/server/src/scheduledTasks/webhookVerification.ts:33`（comparison）；`apps/web/src/components/settings/ScheduledTasksSettings.tsx:1241`（never-attribute）；`apps/web/src/components/settings/scheduledTasksSettings.logic.ts:78`（ts-type）；`apps/web/src/components/settings/scheduledTasksSettings.logic.ts:89`（as-const）；`packages/contracts/src/scheduledTask.ts:63`（schema-literal）

### `left`（A，message，1 处）

- 显示位置（照常转换）：`apps/web/src/components/usage/UsageLimitsPooled.tsx:514`（A，PoolWindowCard）
- 同一文本作为值用途字面量出现 124 次：`apps/desktop/src/preview/PickPreload.ts:613`（object-key）；`apps/desktop/src/preview/PickPreload.ts:963`（object-key）；`apps/desktop/src/preview/PickPreload.ts:967`（object-key）；`apps/desktop/src/preview/PickPreload.ts:978`（object-key）；`apps/desktop/src/preview/PickPreload.ts:1005`（object-key）；`apps/desktop/src/preview/PickPreload.ts:1006`（object-key）；`apps/desktop/src/preview/PickPreload.ts:1008`（object-key）；`apps/desktop/src/preview/PickPreload.ts:1012`（object-key）；`apps/desktop/src/preview/PickPreload.ts:1016`（object-key）；`apps/desktop/src/preview/PickPreload.ts:1042`（object-key）；…（共 124 处）

### `minutes`（A，message，1 处）

- 显示位置（照常转换）：`apps/web/src/components/settings/ScheduledTasksSettings.tsx:1320`（A，ScheduledTaskEditorDialog）
- 同一文本作为值用途字面量出现 10 次：`apps/server/src/cli/trace.ts:107`（object-key）；`apps/server/src/cloud/http.ts:453`（object-key）；`apps/server/src/cloud/http.ts:1488`（object-key）；`apps/server/src/relay/AgentAwarenessRelay.ts:261`（object-key）；`apps/web/src/components/CustomSnoozeDialog.tsx:64`（ts-type）；`apps/web/src/components/CustomSnoozeDialog.tsx:189`（object-key）；`apps/web/src/components/CustomSnoozeDialog.tsx:191`（comparison）；`apps/web/src/components/CustomSnoozeDialog.tsx:200`（never-attribute）；`packages/client-runtime/src/state/threadSettled.ts:326`（ts-type）；`packages/client-runtime/src/state/threadSettled.ts:335`（object-key）

### `none`（A，message，1 处）

- 显示位置（照常转换）：`apps/web/src/components/GitActionsControl.tsx:2006`（A，GitActionsControl）
- 同一文本作为值用途字面量出现 122 次：`apps/desktop/src/electron/ElectronDialog.ts:42`（schema-literal）；`apps/desktop/src/preview/FaviconCapture.ts:37`（ts-type）；`apps/desktop/src/preview/Manager.ts:122`（ts-type）；`apps/desktop/src/preview/PickPreload.ts:63`（comparison）；`apps/desktop/src/preview/PickPreload.ts:83`（comparison）；`apps/desktop/src/preview/PickPreload.ts:1031`（comparison）；`apps/desktop/src/preview/RecordingCursor.ts:44`（ts-type）；`apps/server/src/cloud/managedTunnelStartup.ts:14`（ts-type）；`apps/server/src/device/DeviceActions.ts:527`（comparison）；`apps/server/src/device/localSshDeviceHost.ts:42`（comparison）；…（共 122 处）

### `now`（A，message，1 处）

- 显示位置（照常转换）：`apps/web/src/components/chat/ComposerTasksBadge.tsx:209`（A，ComposerTasksContent）
- 同一文本作为值用途字面量出现 150 次：`apps/server/src/auth/PairingGrantStore.ts:335`（object-key）；`apps/server/src/auth/PairingGrantStore.ts:517`（object-key）；`apps/server/src/auth/SessionStore.ts:958`（object-key）；`apps/server/src/background/BackgroundPolicy.ts:184`（object-key）；`apps/server/src/background/BackgroundPolicy.ts:231`（object-key）；`apps/server/src/mcp/McpSessionRegistry.ts:65`（object-key）；`apps/server/src/orchestration-v2/Adapters/AcpAdapterV2.ts:758`（object-key）；`apps/server/src/orchestration-v2/Adapters/AcpAdapterV2.ts:2628`（object-key）；`apps/server/src/orchestration-v2/Adapters/AcpAdapterV2.ts:2780`（object-key）；`apps/server/src/orchestration-v2/Adapters/AcpAdapterV2.ts:2798`（object-key）；…（共 150 处）

### `optionId`（B，message，1 处）

- 显示位置（照常转换）：`apps/web/src/components/settings/CustomModelEditor.tsx:233`（B，renderDescriptor）
- 同一文本作为值用途字面量出现 19 次：`apps/server/src/orchestration-v2/Adapters/AcpAdapterV2.ts:5649`（object-key）；`apps/server/src/orchestration-v2/Adapters/AcpAdapterV2.ts:5659`（object-key）；`apps/server/src/orchestration-v2/Adapters/AcpAdapterV2.ts:5733`（object-key）；`apps/server/src/orchestration-v2/Adapters/AcpAdapterV2.ts:6325`（object-key）；`apps/server/src/provider/acp/AntigravityProtocol.ts:172`（object-key）；`apps/server/src/provider/acp/AntigravityProtocol.ts:176`（object-key）；`apps/web/src/components/chat/ComposerCommandMenu.tsx:161`（object-key）；`packages/effect-acp/src/_generated/schema-v1.gen.ts:3112`（object-key）；`packages/effect-acp/src/_generated/schema-v1.gen.ts:3122`（object-key）；`packages/effect-acp/src/_generated/schema-v1.gen.ts:3141`（object-key）；…（共 19 处）

### `or`（A，message，1 处）

- 显示位置（照常转换）：`apps/web/src/components/settings/KeybindingsSettings.tsx:536`（A，WhenExpressionNodeEditor）
- 同一文本作为值用途字面量出现 13 次：`apps/server/src/keybindings.ts:187`（switch-case）；`apps/web/src/components/settings/KeybindingsSettings.logic.ts:105`（switch-case）；`apps/web/src/components/settings/KeybindingsSettings.logic.ts:271`（switch-case）；`apps/web/src/components/settings/KeybindingsSettings.tsx:175`（ts-type）；`apps/web/src/components/settings/KeybindingsSettings.tsx:460`（comparison）；`apps/web/src/components/settings/KeybindingsSettings.tsx:536`（never-attribute）；`apps/web/src/keybindings.ts:171`（switch-case）；`packages/client-runtime/src/work-log/commandLabel.ts:128`（membership）；`packages/client-runtime/src/work-log/commandLabel.ts:191`（membership）；`packages/contracts/src/keybindings.ts:177`（schema-literal）；…（共 13 处）

### `origin`（B，message，1 处）

- 显示位置（照常转换）：`apps/web/src/components/GitActionsControl.tsx:916`（B，PublishRepositoryDialog）
- 同一文本作为值用途字面量出现 89 次：`apps/desktop/src/electron/ElectronProtocol.ts:169`（comparison）；`apps/server/src/cli/pair.ts:175`（object-key）；`apps/server/src/cli/pair.ts:523`（object-key）；`apps/server/src/cli/project.ts:353`（object-key）；`apps/server/src/cli/project.ts:359`（object-key）；`apps/server/src/cli/project.ts:370`（object-key）；`apps/server/src/cli/project.ts:374`（object-key）；`apps/server/src/cli/sshHelper.ts:101`（object-key）；`apps/server/src/cloud/config.ts:31`（object-key）；`apps/server/src/cloud/http.ts:349`（object-key）；…（共 89 处）

### `outdated`（A，message，1 处）

- 显示位置（照常转换）：`apps/web/src/components/pullRequest/PullRequestReviewAnnotation.tsx:231`（A，ReviewThreadCard）
- 同一文本作为值用途字面量出现 1 次：`apps/server/src/pullRequest/bitbucketPullRequestJson.ts:114`（object-key）

### `override`（B，message，1 处）

- 显示位置（照常转换）：`apps/web/src/components/settings/settingsLayout.tsx:343`（B，SettingsRow）
- 同一文本作为值用途字面量出现 4 次：`apps/server/src/provider/AntigravityInstallation.ts:79`（ts-type）；`apps/server/src/provider/AntigravityInstallation.ts:251`（ts-type）；`packages/contracts/src/relayClient.ts:7`（schema-literal）；`packages/shared/src/relayClient.ts:25`（ts-type）

### `process`（A，message，1 处）

- 显示位置（照常转换）：`apps/web/src/components/settings/ResourceTelemetryDiagnostics.tsx:289`（A，AggregateCard）
- 同一文本作为值用途字面量出现 38 次：`apps/desktop/src/wsl/DesktopWslEnvironment.ts:160`（ts-type）；`apps/desktop/src/wsl/DesktopWslEnvironment.ts:179`（switch-case）；`apps/server/src/resourceTelemetry/Model.ts:17`（object-key）；`apps/server/src/resourceTelemetry/Model.ts:563`（object-key）；`apps/server/src/resourceTelemetry/ResourceTelemetryHistory.ts:45`（object-key）；`apps/server/src/resourceTelemetry/ResourceTelemetryHistory.ts:266`（object-key）；`apps/server/src/serviceLauncher.ts:43`（object-key）；`apps/server/src/serviceLauncher.ts:450`（object-key）；`apps/server/src/sourceControl/ForgejoSourceControlProvider.ts:90`（object-key）；`apps/server/src/sourceControl/ForgejoSourceControlProvider.ts:136`（object-key）；…（共 38 处）

### `processes`（A，message，1 处）

- 显示位置（照常转换）：`apps/web/src/components/settings/ResourceTelemetryDiagnostics.tsx:289`（A，AggregateCard）
- 同一文本作为值用途字面量出现 20 次：`apps/server/src/diagnostics/ProcessDiagnostics.ts:84`（object-key）；`apps/server/src/resourceTelemetry/Model.ts:59`（object-key）；`apps/server/src/resourceTelemetry/Model.ts:597`（object-key）；`apps/server/src/resourceTelemetry/NativeTelemetryClient.ts:680`（object-key）；`apps/server/src/resourceTelemetry/NativeTelemetryClient.ts:853`（object-key）；`apps/server/src/resourceTelemetry/ResourceTelemetry.ts:187`（object-key）；`apps/server/src/resourceTelemetry/ResourceTelemetry.ts:300`（object-key）；`apps/web/src/components/settings/DiagnosticsSettings.tsx:298`（object-key）；`apps/web/src/components/settings/DiagnosticsSettings.tsx:303`（object-key）；`apps/web/src/components/settings/DiagnosticsSettings.tsx:555`（object-key）；…（共 20 处）

### `root`（B，message，1 处）

- 显示位置（照常转换）：`apps/web/src/components/settings/ConnectionsSettings.tsx:2968`（B，renderSshFields）
- 同一文本作为值用途字面量出现 101 次：`apps/desktop/src/snapShot/SnapShotAccessibility.ts:46`（ts-type）；`apps/desktop/src/snapShot/SnapShotAccessibility.ts:74`（object-key）；`apps/desktop/src/snapShot/SnapShotAccessibility.ts:88`（object-key）；`apps/desktop/src/snapShot/snapShot.ts:304`（object-key）；`apps/desktop/src/snapShot/snapShot.ts:340`（object-key）；`apps/desktop/src/snapShot/snapShot.ts:359`（object-key）；`apps/desktop/src/snapShot/snapShot.ts:439`（object-key）；`apps/desktop/src/wsl/DesktopWslServerTree.ts:24`（object-key）；`apps/desktop/src/wsl/DesktopWslServerTree.ts:206`（object-key）；`apps/desktop/src/wsl/DesktopWslServerTree.ts:210`（object-key）；…（共 101 处）

### `server`（B，message，1 处）

- 显示位置（照常转换）：`apps/web/src/components/settings/ConnectionsSettings.tsx:3528`（B，ConnectionsSettings）
- 同一文本作为值用途字面量出现 136 次：`apps/desktop/src/app/DesktopAppActivation.ts:218`（object-key）；`apps/desktop/src/app/DesktopAppActivation.ts:232`（object-key）；`apps/desktop/src/app/DesktopAppActivation.ts:252`（object-key）；`apps/server/src/cli/triage.ts:199`（object-key）；`apps/server/src/cli/triagePrompt.ts:174`（object-key）；`apps/server/src/diagnostics/ProcessResourceMonitor.ts:24`（comparison）；`apps/server/src/diagnostics/ProcessResourceMonitor.ts:45`（comparison）；`apps/server/src/htmlRender/publicProxy.ts:149`（object-key）；`apps/server/src/htmlRender/publicProxy.ts:231`（object-key）；`apps/server/src/htmlRender/publicProxy.ts:234`（object-key）；…（共 136 处）

### `setup`（A，message，1 处）

- 显示位置（照常转换）：`apps/web/src/components/settings/ProjectActionsList.tsx:38`（A，ProjectActionsList）
- 同一文本作为值用途字面量出现 13 次：`apps/desktop/src/snapShot/DesktopSnapShot.ts:175`（object-key）；`apps/desktop/src/snapShot/DesktopSnapShot.ts:1518`（object-key）；`apps/server/src/provider/Drivers/AcpRegistryDriver.ts:228`（object-key）；`apps/server/src/provider/Drivers/CodexManagedProvider.ts:56`（object-key）；`apps/server/src/provider/Drivers/CodexManagedProvider.ts:150`（object-key）；`apps/server/src/provider/Drivers/CursorDriver.ts:143`（object-key）；`apps/server/src/provider/Layers/AntigravityProvider.ts:155`（object-key）；`apps/web/src/components/files/useFileSaveCoordinator.ts:30`（object-key）；`apps/web/src/components/settings/ProviderInstanceCard.tsx:497`（object-key）；`apps/web/src/components/settings/ProviderInstanceCard.tsx:552`（object-key）；…（共 13 处）

### `stack`（A，message，1 处）

- 显示位置（照常转换）：`apps/web/src/components/ThreadStatusIndicators.tsx:375`（A，ThreadPullRequestsMiniList）
- 同一文本作为值用途字面量出现 63 次：`apps/desktop/src/preview/PickPreload.ts:410`（object-key）；`apps/desktop/src/preview/PickPreload.ts:423`（object-key）；`apps/desktop/src/preview/PickedElementPayload.ts:46`（computed-key）；`apps/desktop/src/preview/PickedElementPayload.ts:47`（computed-key）；`apps/server/src/git/detachStackFrame.ts:9`（object-key）；`apps/server/src/mcp/toolkits/pullRequests/handlers.ts:116`（ts-type）；`apps/server/src/mcp/toolkits/pullRequests/handlers.ts:137`（object-key）；`apps/server/src/mcp/toolkits/pullRequests/tools.ts:233`（object-key）；`apps/server/src/orchestration-v2/Orchestrator.ts:518`（object-key）；`apps/server/src/orchestration-v2/Orchestrator.ts:2946`（comparison）；…（共 63 处）

### `team`（A，message，1 处）

- 显示位置（照常转换）：`apps/web/src/components/pullRequest/PullRequestReviewerPicker.tsx:125`（A，PullRequestReviewerPicker）
- 同一文本作为值用途字面量出现 6 次：`apps/server/src/orchestration-v2/Adapters/CursorAdapterV2.ts:300`（as-const）；`apps/server/src/provider/Layers/ClaudeProvider.ts:101`（switch-case）；`apps/server/src/provider/Layers/CodexProvider.ts:126`（switch-case）；`apps/server/src/pullRequest/gitHubPullRequestJson.ts:2656`（comparison）；`apps/web/src/components/pullRequest/PullRequestReviewerPicker.tsx:124`（comparison）；`packages/contracts/src/pullRequest.ts:268`（schema-literal）

### `unavailable`（A，message，1 处）

- 显示位置（照常转换）：`apps/web/src/components/device/DeviceHostAvailability.tsx:17`（A，DeviceHostAvailability）
- 同一文本作为值用途字面量出现 88 次：`apps/desktop/src/backend/DesktopServerExposure.ts:305`（object-key）；`apps/desktop/src/backend/DesktopServerExposure.ts:405`（object-key）；`apps/desktop/src/preview/BrowserImport/BrowserImport.ts:192`（object-key）；`apps/desktop/src/snapShot/DesktopSnapShot.ts:861`（comparison）；`apps/desktop/src/snapShot/DesktopSnapShot.ts:1013`（comparison）；`apps/desktop/src/snapShot/DesktopSnapShot.ts:1087`（comparison）；`apps/desktop/src/snapShot/DesktopSnapShot.ts:1098`（comparison）；`apps/desktop/src/snapShot/DesktopSnapShot.ts:1101`（comparison）；`apps/desktop/src/snapShot/DesktopSnapShot.ts:1133`（comparison）；`apps/desktop/src/snapShot/DesktopSnapShot.ts:1140`（comparison）；…（共 88 处）

### `viewed`（A，message，1 处）

- 显示位置（照常转换）：`apps/web/src/components/pullRequest/PullRequestCodeTab.tsx:1134`（A，PullRequestCodeTab）
- 同一文本作为值用途字面量出现 14 次：`apps/server/src/persistence/PullRequestFilesViewed.ts:48`（object-key）；`apps/server/src/pullRequest/GitHubPullRequestCli.ts:657`（object-key）；`apps/server/src/pullRequest/PullRequestProvider.ts:522`（object-key）；`apps/server/src/pullRequest/gitHubPullRequestJson.ts:2984`（object-key）；`apps/server/src/pullRequest/pullRequestViewedFiles.ts:273`（as-const）；`apps/server/src/pullRequest/pullRequestViewedFiles.ts:281`（as-const）；`apps/server/src/pullRequest/pullRequestViewedFiles.ts:360`（object-key）；`apps/web/src/components/pullRequest/pullRequestFilesViewed.logic.ts:22`（comparison）；`apps/web/src/components/pullRequest/pullRequestFilesViewed.logic.ts:84`（object-key）；`apps/web/src/components/pullRequest/pullRequestFilesViewed.logic.ts:88`（object-key）；…（共 14 处）
