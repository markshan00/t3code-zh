# A/B 值用途重名 v0.0.46-nightly.20261007.2761

A（JSX 文本/子表达式）和 B 原始白名单属性的文字，即使同一文本也出现在「从不转换」的值用途位置（比较、`switch case`、`as const`、字面量类型、对象键），仍照常转换——它们只用于显示。§4 要求把这些位置列出以便人工核对：若上游将来改成拿这些字段做判断，就需要改判定。

共 216 处显示位置（113 条文字）。此清单与 suspicious、可翻译计数分开统计，不计入可翻译位置总数。

### `Off`（A，message，10 处）

- 显示位置（照常转换）：`apps/web/src/components/chat/TraitsPicker.tsx:474`（A，TraitsMenuContent）；`apps/web/src/components/clerk/MobileClientsUserProfilePage.tsx:31`（A，MobileClientStatusBadge）；`apps/web/src/components/settings/ConnectionsSettings.tsx:3510`（A，renderWslRow）；`apps/web/src/components/settings/GitHubRoutingSettings.tsx:72`（B，GitHubRoutingSettings）；`apps/web/src/components/settings/LoadBalancingSettings.tsx:77`（B，LoadBalancingSettings）；`apps/web/src/components/settings/SnapShotSettings.tsx:500`（A，SnapShotSettings）；`apps/web/src/components/settings/SnapShotSettings.tsx:517`（A，SnapShotSettings）；`apps/web/src/components/settings/StorageSettings.tsx:136`（A，RetentionControl）；`apps/web/src/components/settings/StorageSettings.tsx:248`（A，StorageSettingsPanel）；`apps/web/src/components/settings/StorageSettings.tsx:254`（A，StorageSettingsPanel）
- 同一文本作为值用途字面量出现 2 次：`packages/shared/src/otelEnvironment.ts:32`（object-key）；`packages/shared/src/otelEnvironment.ts:392`（object-key）

### `Close`（B，message，8 处）

- 显示位置（照常转换）：`apps/web/src/components/files/AttachmentFilePreview.tsx:347`（B，AttachmentFilePreview）；`apps/web/src/components/onboarding/WelcomeWizard.tsx:1160`（A，AgentInstallTerminal）；`apps/web/src/components/pullRequest/PullRequestDetailPanel.tsx:2891`（A，PullRequestDetailPanel）；`apps/web/src/components/settings/BrowserImportWizard.tsx:601`（A，BlockedStep）；`apps/web/src/components/settings/ProjectFaviconPickerDialog.tsx:80`（B，ProjectFaviconPickerDialog）；`apps/web/src/components/settings/SnapShotSetupDialog.tsx:392`（A，SnapShotSetupDialog）；`apps/web/src/components/ui/dialog.tsx:96`（B，DialogPopup）；`apps/web/src/components/ui/sheet.tsx:112`（B，SheetPopup）
- 同一文本作为值用途字面量出现 2 次：`apps/desktop/src/backend/DesktopBackendPool.ts:210`（ts-type）；`apps/desktop/src/backend/DesktopBackendPool.ts:396`（as-const）

### `Default`（A，message，6 处）

- 显示位置（照常转换）：`apps/web/src/components/chat/TraitsPicker.tsx:98`（A，DefaultBadge）；`apps/web/src/components/settings/ConnectionsSettings.tsx:1450`（A，AdvertisedEndpointListRow）；`apps/web/src/components/settings/CustomModelEditor.tsx:181`（A，renderChoice）；`apps/web/src/components/settings/DeviceHostEditor.tsx:131`（B，DeviceHostEditor）；`apps/web/src/components/settings/IntegrationsSettings.tsx:1340`（A，BrowserProfilesSetting）；`apps/web/src/components/settings/StorageSettings.tsx:69`（B，WorktreesDirectoryRow）
- 同一文本作为值用途字面量出现 4 次：`apps/web/src/components/device/DeviceControlsRail.tsx:167`（as-const）；`apps/web/src/components/settings/KeybindingsSettings.logic.ts:48`（ts-type）；`apps/web/src/components/settings/KeybindingsSettings.tsx:902`（comparison）；`apps/web/src/components/settings/KeybindingsSettings.tsx:937`（comparison）

### `Mixed`（B，message，5 处）

- 显示位置（照常转换）：`apps/web/src/components/settings/BranchNamingSettings.tsx:100`（B，BranchNamingSettings）；`apps/web/src/components/settings/ProjectDefaultsSettings.tsx:311`（A，ProjectDefaultsSettings）；`apps/web/src/components/settings/SettingsPanels.tsx:3098`（B，GeneralSettingsPanel）；`apps/web/src/components/settings/StorageSettings.tsx:69`（B，WorktreesDirectoryRow）；`apps/web/src/components/settings/StorageSettings.tsx:244`（A，StorageSettingsPanel）
- 同一文本作为值用途字面量出现 1 次：`apps/web/src/components/usage/UsagePriceOverrides.tsx:212`（comparison）

### `None`（A，message，5 处）

- 显示位置（照常转换）：`apps/web/src/components/device/DeviceToolVersions.tsx:69`（A，DeviceToolVersions）；`apps/web/src/components/pullRequest/PullRequestGhosts.tsx:363`（A，PullRequestDetailGhost）；`apps/web/src/components/pullRequest/PullRequestSummaryTab.tsx:717`（A，PullRequestSummaryTab）；`apps/web/src/components/pullRequest/PullRequestSummaryTab.tsx:802`（A，PullRequestSummaryTab）；`apps/web/src/components/settings/ScheduledTasksSettings.tsx:1233`（B，ScheduledTaskEditorDialog）
- 同一文本作为值用途字面量出现 14 次：`apps/server/src/device/LocalDeviceHost.ts:321`（comparison）；`apps/server/src/orchestration-v2/Adapters/OpenCode2AdapterV2.ts:1915`（comparison）；`apps/server/src/orchestration-v2/Adapters/OpenCode2AdapterV2.ts:2875`（comparison）；`apps/server/src/orchestration-v2/Adapters/OpenCode2AdapterV2.ts:2957`（comparison）；`apps/server/src/orchestration-v2/Adapters/OpenCode2AdapterV2.ts:3953`（comparison）；`apps/server/src/project/RepositoryIdentityResolver.ts:131`（comparison）；`apps/server/src/project/RepositoryIdentityResolver.ts:153`（comparison）；`apps/server/src/sourceControl/PrTemplateDetection.ts:91`（ts-type）；`apps/server/src/sourceControl/PrTemplateDetection.ts:124`（as-const）；`apps/server/src/vcs/VcsStatusBroadcaster.ts:162`（comparison）；…（共 14 处）

### `Sign in`（A，message，5 处）

- 显示位置（照常转换）：`apps/web/src/components/cloud/ConnectCliAuthSurface.tsx:107`（A，ConnectCliAuthorizeSurface）；`apps/web/src/components/onboarding/WelcomeWizard.tsx:493`（A，ConnectAccountOption）；`apps/web/src/components/onboarding/WelcomeWizard.tsx:1007`（A，AgentCard）；`apps/web/src/components/settings/ProviderAuthenticationSection.tsx:298`（A，ProviderAuthenticationSection）；`apps/web/src/components/settings/ProviderWizardAuthenticationStep.tsx:71`（A，ProviderWizardAuthenticationStep）
- 同一文本作为值用途字面量出现 1 次：`apps/web/src/components/settings/AddProviderInstanceDialog.logic.ts:9`（as-const）

### `Unavailable`（A，message，5 处）

- 显示位置（照常转换）：`apps/web/src/components/chat/ModelListRow.tsx:82`（A，ModelListRow）；`apps/web/src/components/chat/ProviderModelPicker.tsx:279`（A，ProviderModelPicker）；`apps/web/src/components/cloud/CloudEnvironmentConnectList.tsx:424`（A，CloudEnvironmentConnectRows）；`apps/web/src/components/settings/CodexSetupSection.tsx:1057`（B，CodexManagedRuntimeFields）；`apps/web/src/components/settings/CodexSetupSection.tsx:1076`（B，CodexManagedRuntimeFields）
- 同一文本作为值用途字面量出现 2 次：`apps/web/src/components/settings/ResourceTelemetryDiagnostics.tsx:1217`（never-attribute）；`apps/web/src/components/usage/UsagePriceOverrides.tsx:213`（comparison）

### `Actions`（A，message，4 处）

- 显示位置（照常转换）：`apps/web/src/components/ProjectScriptsControl.tsx:388`（A，ProjectScriptsControl）；`apps/web/src/components/ProjectScriptsControl.tsx:432`（A，ProjectScriptsControl）；`apps/web/src/components/settings/ProjectActionsSettings.tsx:136`（B，ProjectActionsSettings）；`apps/web/src/components/settings/ProjectActionsSettings.tsx:141`（B，ProjectActionsSettings）
- 同一文本作为值用途字面量出现 1 次：`apps/web/src/components/chat/ComposerBanner.tsx:352`（object-key）

### `Codex`（B，message，4 处）

- 显示位置（照常转换）：`apps/web/src/components/onboarding/WelcomeWizard.tsx:1771`（B，ImportRowMeta）；`apps/web/src/components/settings/CodexSetupSection.tsx:70`（B，CodexSetupSection）；`apps/web/src/components/settings/CodexSetupSection.tsx:130`（B，CodexSetupSection）；`apps/web/src/components/settings/CodexSetupSection.tsx:772`（B，ManagedCodexSetup）
- 同一文本作为值用途字面量出现 1 次：`apps/server/src/provider/CodexProvider.ts:68`（as-const）

### `Command`（A，message，4 处）

- 显示位置（照常转换）：`apps/web/src/components/projectScriptEditor.tsx:407`（A，ProjectScriptEditorDialog）；`apps/web/src/components/settings/DiagnosticsSettings.tsx:370`（A，ProcessDiagnosticsTable）；`apps/web/src/components/settings/DiagnosticsSettings.tsx:599`（A，ProcessResourceHistoryTable）；`apps/web/src/components/settings/KeybindingsSettings.tsx:1116`（B，NewKeybindingCommandSelect）
- 同一文本作为值用途字面量出现 2 次：`apps/web/src/lib/embeddedScripts.ts:244`（switch-case）；`apps/web/src/shortcutModifierState.ts:82`（switch-case）

### `Enter`（A，message，4 处）

- 显示位置（照常转换）：`apps/web/src/components/CommandPalette.tsx:3335`（A，OpenCommandPaletteDialog）；`apps/web/src/components/CommandPalette.tsx:3362`（A，OpenCommandPaletteDialog）；`apps/web/src/components/CommandPalette.tsx:3403`（A，OpenCommandPaletteDialog）；`apps/web/src/components/CommandPaletteContent.tsx:80`（A，CommandPaletteContent）
- 同一文本作为值用途字面量出现 57 次：`apps/desktop/src/preview/AnnotationKeyboard.ts:15`（comparison）；`apps/desktop/src/preview/RecordingInput.ts:29`（object-key）；`apps/web/src/browser/ServerBrowserSurface.tsx:682`（comparison）；`apps/web/src/components/BranchPicker.tsx:183`（comparison）；`apps/web/src/components/ChatMarkdown.tsx:1592`（comparison）；`apps/web/src/components/CommandPalette.tsx:3097`（comparison）；`apps/web/src/components/CommandPalette.tsx:3107`（comparison）；`apps/web/src/components/CommandPalette.tsx:3120`（comparison）；`apps/web/src/components/CommandPalette.tsx:3162`（comparison）；`apps/web/src/components/ComposerPromptEditorTiptap.tsx:975`（comparison）；…（共 57 处）

### `Loading`（A，message，4 处）

- 显示位置（照常转换）：`apps/web/src/components/settings/AcpSessionManagementSection.tsx:362`（A，AcpSessionManagementSection）；`apps/web/src/components/settings/AcpSessionManagementSection.tsx:435`（A，AcpSessionManagementSection）；`apps/web/src/components/settings/AcpSessionManagementSection.tsx:458`（A，AcpSessionManagementSection）；`apps/web/src/components/ui/spinner.tsx:31`（B，Spinner）
- 同一文本作为值用途字面量出现 10 次：`apps/desktop/src/preview/Manager.ts:86`（ts-type）；`apps/desktop/src/preview/Manager.ts:1884`（comparison）；`apps/desktop/src/preview/Manager.ts:1937`（comparison）；`apps/server/src/preview/ServerBrowser.ts:839`（comparison）；`apps/web/src/components/preview/PreviewView.tsx:195`（comparison）；`apps/web/src/components/preview/usePreviewBridge.ts:111`（comparison）；`apps/web/src/components/preview/usePreviewBridge.ts:111`（comparison）；`apps/web/src/components/preview/usePreviewBridge.ts:122`（comparison）；`packages/client-runtime/src/state/assets.ts:71`（ts-type）；`packages/contracts/src/ipc.ts:580`（ts-type）

### `Ready`（A，message，4 处）

- 显示位置（照常转换）：`apps/web/src/components/device/DeviceSetup.tsx:313`（A，PlatformStatus）；`apps/web/src/components/onboarding/WelcomeWizard.tsx:991`（A，AgentCard）；`apps/web/src/components/settings/CodexSetupSection.tsx:100`（A，CodexSetupSection）；`apps/web/src/components/settings/CodexSetupSection.tsx:814`（A，ManagedCodexSetup）
- 同一文本作为值用途字面量出现 5 次：`apps/desktop/src/backend/DesktopBackendConfiguration.ts:291`（ts-type）；`apps/desktop/src/backend/DesktopBackendConfiguration.ts:447`（as-const）；`apps/desktop/src/backend/DesktopBackendConfiguration.ts:498`（as-const）；`apps/desktop/src/backend/DesktopBackendConfiguration.ts:715`（comparison）；`apps/desktop/src/backend/DesktopBackendConfiguration.ts:757`（comparison）

### `file`（A，message，4 处）

- 显示位置（照常转换）：`apps/web/src/components/chat/ThreadDetailsPrRow.tsx:295`（A，ThreadDetailsPrRow）；`apps/web/src/components/pullRequest/PullRequestCodeTab.tsx:1124`（A，PullRequestCodeTab）；`apps/web/src/components/pullRequest/PullRequestDetailPanel.tsx:2523`（A，PullRequestDetailPanel）；`apps/web/src/components/pullRequest/PullRequestSummaryTab.tsx:421`（A，CommentGroup）
- 同一文本作为值用途字面量出现 196 次：`apps/desktop/src/permissions/MacPermissionHelper.ts:143`（object-key）；`apps/server/src/assets/AssetAccess.ts:171`（ts-type）；`apps/server/src/assets/AssetAccess.ts:176`（object-key）；`apps/server/src/assets/AssetAccess.ts:914`（object-key）；`apps/server/src/assets/AttachmentUpload.ts:45`（schema-literal）；`apps/server/src/assets/AttachmentUpload.ts:98`（comparison）；`apps/server/src/assets/AttachmentUpload.ts:164`（comparison）；`apps/server/src/attachmentStore.ts:147`（switch-case）；`apps/server/src/http.ts:167`（object-key）；`apps/server/src/http.ts:491`（object-key）；…（共 196 处）

### `files`（A，message，4 处）

- 显示位置（照常转换）：`apps/web/src/components/chat/ThreadDetailsPrRow.tsx:295`（A，ThreadDetailsPrRow）；`apps/web/src/components/pullRequest/PullRequestCodeTab.tsx:1124`（A，PullRequestCodeTab）；`apps/web/src/components/pullRequest/PullRequestDetailPanel.tsx:2523`（A，PullRequestDetailPanel）；`apps/web/src/components/pullRequest/PullRequestSummaryTab.tsx:421`（A，CommentGroup）
- 同一文本作为值用途字面量出现 183 次：`apps/desktop/src/snapShot/CaptureShortcutConfig.ts:99`（object-key）；`apps/desktop/src/snapShot/CaptureShortcutConfig.ts:209`（object-key）；`apps/desktop/src/snapShot/CaptureShortcutConfig.ts:224`（object-key）；`apps/server/src/git/GitManager.ts:1035`（object-key）；`apps/server/src/git/GitWorkflowService.ts:129`（object-key）；`apps/server/src/orchestration-v2/Adapters/CursorAdapterV2.ts:461`（comparison）；`apps/server/src/orchestration-v2/Adapters/CursorAdapterV2.ts:666`（object-key）；`apps/server/src/orchestration-v2/Adapters/OpenCode2AdapterV2.ts:3123`（object-key）；`apps/server/src/orchestration-v2/CheckpointCaptureService.ts:283`（object-key）；`apps/server/src/orchestration-v2/CheckpointService.ts:227`（object-key）；…（共 183 处）

### `Android`（A，message，3 处）

- 显示位置（照常转换）：`apps/web/src/components/NightlyMobileBeta.tsx:131`（A，NightlyMobileBetaRow）；`apps/web/src/components/RightPanelTabs.tsx:1438`（A，DeviceTabTooltip）；`apps/web/src/components/device/DeviceHostAvailability.tsx:16`（A，DeviceHostAvailability）
- 同一文本作为值用途字面量出现 2 次：`apps/server/src/ws.ts:669`（comparison）；`packages/contracts/src/baseSchemas.ts:353`（schema-literal）

### `Branch`（A，message，3 处）

- 显示位置（照常转换）：`apps/web/src/components/DiffPanel.tsx:846`（A，DiffPanel）；`apps/web/src/components/GitActionsControl.tsx:2002`（A，GitActionsControl）；`apps/web/src/components/chat/WorktreeSetupCard.tsx:262`（A，SetupDetails）
- 同一文本作为值用途字面量出现 1 次：`apps/web/src/components/chat/SubagentTooltipContent.tsx:173`（comparison）

### `Delete`（A，message，3 处）

- 显示位置（照常转换）：`apps/web/src/components/projectScriptEditor.tsx:471`（A，ProjectScriptEditorDialog）；`apps/web/src/components/settings/AcpSessionManagementSection.tsx:417`（A，AcpSessionManagementSection）；`apps/web/src/components/settings/ScheduledTasksSettings.tsx:509`（A，ScheduledTaskRow）
- 同一文本作为值用途字面量出现 8 次：`apps/desktop/src/preview/RecordingInput.ts:32`（object-key）；`apps/web/src/browser/ServerBrowserSurface.tsx:64`（as-const）；`apps/web/src/browser/ServerBrowserSurface.tsx:64`（as-const）；`apps/web/src/browser/ServerBrowserSurface.tsx:698`（comparison）；`apps/web/src/components/projectScriptEditor.tsx:228`（comparison）；`apps/web/src/terminal/ghostty/keyCodes.ts:73`（as-const）；`packages/client-runtime/src/device/stream.ts:303`（object-key）；`packages/client-runtime/src/device/stream.ts:333`（object-key）

### `Host`（B，message，3 处）

- 显示位置（照常转换）：`apps/web/src/components/pullRequest/PullRequestListFilters.tsx:561`（B，PullRequestFiltersMenu）；`apps/web/src/components/settings/ConnectionsSettings.tsx:2986`（A，renderRemoteFields）；`apps/web/src/components/settings/GitHubTokenSettings.tsx:90`（A，GitHubTokenSettings）
- 同一文本作为值用途字面量出现 1 次：`apps/web/src/components/chat/ComposerSurface.tsx:101`（object-key）

### `Nightly`（A，message，3 处）

- 显示位置（照常转换）：`apps/web/src/components/settings/SettingsPanels.tsx:468`（A，AboutVersionSection）；`apps/web/src/components/settings/SettingsPanels.tsx:476`（A，AboutVersionSection）；`apps/web/src/components/settings/SettingsPanels.tsx:504`（A，AboutVersionSection）
- 同一文本作为值用途字面量出现 3 次：`apps/web/src/components/SidebarStageBackdrop.tsx:9`（ts-type）；`packages/contracts/src/ipc.ts:84`（ts-type）；`packages/contracts/src/ipc.ts:99`（schema-literal）

### `Process`（A，message，3 处）

- 显示位置（照常转换）：`apps/web/src/components/settings/DiagnosticsSettings.tsx:593`（A，ProcessResourceHistoryTable）；`apps/web/src/components/settings/ResourceTelemetryDiagnostics.tsx:599`（A，ProcessTable）；`apps/web/src/components/settings/ResourceTelemetryDiagnostics.tsx:703`（A，HistoryProcessTable）
- 同一文本作为值用途字面量出现 3 次：`apps/desktop/src/preview/RecordingInput.ts:21`（membership）；`apps/web/src/browser/ServerBrowserSurface.tsx:660`（comparison）；`apps/web/src/terminal/ghostty/surface.ts:420`（comparison）

### `Project`（B，message，3 处）

- 显示位置（照常转换）：`apps/web/src/components/pullRequest/PullRequestListFilters.tsx:583`（B，PullRequestFiltersMenu）；`apps/web/src/components/settings/ProjectSettingsPanel.tsx:457`（B，ProjectDetail）；`apps/web/src/components/settings/ScheduledTasksSettings.tsx:1037`（B，ScheduledTaskEditorDialog）
- 同一文本作为值用途字面量出现 1 次：`apps/web/src/components/settings/KeybindingsSettings.logic.ts:48`（ts-type）

### `Active`（B，message，2 处）

- 显示位置（照常转换）：`apps/web/src/components/Sidebar.tsx:5398`（B，Sidebar）；`apps/web/src/components/Sidebar.tsx:5409`（B，Sidebar）
- 同一文本作为值用途字面量出现 5 次：`apps/desktop/src/backend/DesktopBackendPool.ts:188`（ts-type）；`apps/desktop/src/backend/DesktopBackendPool.ts:330`（comparison）；`apps/desktop/src/backend/DesktopBackendPool.ts:431`（comparison）；`apps/desktop/src/backend/DesktopBackendPool.ts:437`（comparison）；`apps/web/src/components/settings/ResourceTelemetryDiagnostics.tsx:1145`（never-attribute）

### `Backspace`（A，message，2 处）

- 显示位置（照常转换）：`apps/web/src/components/CommandPaletteContent.tsx:86`（A，CommandPaletteContent）；`apps/web/src/components/projectScriptEditor.tsx:402`（A，ProjectScriptEditorDialog）
- 同一文本作为值用途字面量出现 10 次：`apps/desktop/src/preview/RecordingInput.ts:31`（object-key）；`apps/web/src/browser/ServerBrowserSurface.tsx:63`（as-const）；`apps/web/src/browser/ServerBrowserSurface.tsx:63`（as-const）；`apps/web/src/browser/ServerBrowserSurface.tsx:698`（comparison）；`apps/web/src/components/CommandPalette.tsx:3133`（comparison）；`apps/web/src/components/chat/ComposerStashMenu.tsx:104`（comparison）；`apps/web/src/components/projectScriptEditor.tsx:228`（comparison）；`apps/web/src/terminal/ghostty/keyCodes.ts:58`（as-const）；`packages/client-runtime/src/device/stream.ts:289`（object-key）；`packages/client-runtime/src/device/stream.ts:332`（object-key）

### `Browser`（B，message，2 处）

- 显示位置（照常转换）：`apps/web/src/components/settings/IntegrationsSettings.tsx:1540`（B，IntegrationsSettingsPanel）；`apps/web/src/components/settings/ProjectDefaultsSettings.tsx:264`（B，ProjectDefaultsSettings）
- 同一文本作为值用途字面量出现 6 次：`apps/server/src/provider/CodexToolPresentation.ts:190`（comparison）；`apps/server/src/resourceTelemetry/Model.ts:104`（switch-case）；`apps/web/src/components/RightPanelTabs.tsx:518`（comparison）；`apps/web/src/components/RightPanelTabs.tsx:530`（comparison）；`apps/web/src/components/RightPanelTabs.tsx:1275`（comparison）；`packages/contracts/src/resourceTelemetry.ts:232`（schema-literal）

### `Connect`（A，message，2 处）

- 显示位置（照常转换）：`apps/web/src/components/settings/CodexSetupSection.tsx:695`（A，ManagedCodexSetup）；`apps/web/src/components/settings/ProviderAuthenticationSection.tsx:422`（A，ProviderAuthenticationSection）
- 同一文本作为值用途字面量出现 1 次：`apps/web/src/components/onboarding/WelcomeWizard.tsx:111`（as-const）

### `Custom`（A，message，2 处）

- 显示位置（照常转换）：`apps/web/src/components/settings/StorageSettings.tsx:249`（A，StorageSettingsPanel）；`apps/web/src/components/settings/StorageSettings.tsx:255`（A，StorageSettingsPanel）
- 同一文本作为值用途字面量出现 2 次：`apps/web/src/components/settings/KeybindingsSettings.logic.ts:48`（ts-type）；`apps/web/src/components/settings/KeybindingsSettings.tsx:901`（comparison）

### `Devices`（B，message，2 处）

- 显示位置（照常转换）：`apps/web/src/components/settings/IntegrationsSettings.tsx:632`（B，DeviceIntegrationSettings）；`apps/web/src/components/settings/ProviderSettingsPanel.tsx:377`（B，ProviderSettingsPanelContent）
- 同一文本作为值用途字面量出现 1 次：`apps/web/src/components/device/DevicePanel.tsx:217`（never-attribute）

### `Disabled`（A，message，2 处）

- 显示位置（照常转换）：`apps/web/src/components/onboarding/WelcomeWizard.tsx:996`（A，AgentCard）；`apps/web/src/components/settings/AcpSessionManagementSection.tsx:509`（A，AcpSessionManagementSection）
- 同一文本作为值用途字面量出现 1 次：`apps/web/src/components/settings/ResourceTelemetryDiagnostics.tsx:1138`（never-attribute）

### `Dismiss`（A，message，2 处）

- 显示位置（照常转换）：`apps/web/src/browser/ServerBrowserSurface.tsx:850`（A，ServerBrowserSurface）；`apps/web/src/components/desktop/SshPasswordPromptDialog.tsx:212`（A，ActiveSshPasswordPrompt）
- 同一文本作为值用途字面量出现 1 次：`apps/web/src/components/chat/ComposerBanner.tsx:359`（object-key）

### `Files`（A，message，2 处）

- 显示位置（照常转换）：`apps/web/src/components/GitActionsControl.tsx:2024`（A，GitActionsControl）；`apps/web/src/components/diffs/DiffFileTree.tsx:173`（A，DiffFileTree）
- 同一文本作为值用途字面量出现 1 次：`apps/web/src/components/chat/workspaceFileDrop.ts:26`（membership）

### `Local ACP command`（A，message，2 处）

- 显示位置（照常转换）：`apps/web/src/components/settings/AcpRegistrySearchStep.tsx:186`（A，AcpRegistrySearchStep）；`apps/web/src/components/settings/AddProviderInstanceDialog.tsx:482`（A，AddProviderInstanceDialog）
- 同一文本作为值用途字面量出现 1 次：`apps/web/src/components/settings/AddProviderInstanceDialog.tsx:195`（as-const）

### `New thread`（A，message，2 处）

- 显示位置（照常转换）：`apps/web/src/components/LegacySidebar.tsx:2553`（A，SidebarProjectItem）；`apps/web/src/components/sidebar/SidebarThreadHeader.tsx:136`（B，SidebarThreadHeader）
- 同一文本作为值用途字面量出现 1 次：`apps/server/src/orchestration-v2/ThreadTitleRegenerationService.ts:118`（comparison）

### `Provider`（A，message，2 处）

- 显示位置（照常转换）：`apps/web/src/components/GitActionsControl.tsx:741`（A，PublishRepositoryDialog）；`apps/web/src/components/settings/AddProviderInstanceDialog.tsx:423`（A，AddProviderInstanceDialog）
- 同一文本作为值用途字面量出现 4 次：`apps/web/src/components/GitActionsControl.tsx:630`（as-const）；`apps/web/src/components/settings/AddProviderInstanceDialog.logic.ts:8`（as-const）；`apps/web/src/components/settings/AddProviderInstanceDialog.logic.ts:9`（as-const）；`apps/web/src/components/settings/AddProviderInstanceDialog.logic.ts:10`（as-const）

### `Read`（B，message，2 处）

- 显示位置（照常转换）：`apps/web/src/components/settings/ResourceTelemetryDiagnostics.tsx:297`（B，AggregateCard）；`apps/web/src/components/settings/ResourceTelemetryDiagnostics.tsx:708`（A，HistoryProcessTable）
- 同一文本作为值用途字面量出现 1 次：`apps/server/src/orchestration-v2/Adapters/ClaudeAdapterV2.ts:285`（as-const）

### `Repository`（A，message，2 处）

- 显示位置（照常转换）：`apps/web/src/components/CommandPalette.tsx:3515`（A，OpenCommandPaletteDialog）；`apps/web/src/components/GitActionsControl.tsx:818`（A，PublishRepositoryDialog）
- 同一文本作为值用途字面量出现 4 次：`apps/server/src/project/AgentSessionScanner.ts:700`（ts-type）；`apps/server/src/project/AgentSessionScanner.ts:722`（as-const）；`apps/server/src/project/AgentSessionScanner.ts:1246`（comparison）；`apps/web/src/components/GitActionsControl.tsx:630`（as-const）

### `Settled`（B，message，2 处）

- 显示位置（照常转换）：`apps/web/src/components/Sidebar.tsx:5468`（B，Sidebar）；`apps/web/src/components/Sidebar.tsx:5485`（B，Sidebar）
- 同一文本作为值用途字面量出现 1 次：`apps/web/src/hooks/showThreadUndoNotice.ts:12`（ts-type）

### `Skill`（A，message，2 处）

- 显示位置（照常转换）：`apps/web/src/components/chat/ComposerCommandMenu.tsx:271`（A，SkillSourceBadge）；`apps/web/src/components/chat/MessagesTimeline.tsx:4132`（B，userMessageContextPresentationRegistry）
- 同一文本作为值用途字面量出现 1 次：`packages/shared/src/toolActivity.ts:22`（comparison）

### `Stop`（A，message，2 处）

- 显示位置（照常转换）：`apps/web/src/components/ChatView.tsx:7561`（A，backgroundWorkBannerItem）；`apps/web/src/components/preview/PreviewChromeRow.tsx:164`（B，PreviewChromeRow）
- 同一文本作为值用途字面量出现 2 次：`packages/effect-codex-app-server/src/_generated/schema.gen.ts:52065`（object-key）；`packages/effect-codex-app-server/src/_generated/schema.gen.ts:52089`（object-key）

### `T3 Code`（A，message，2 处）

- 显示位置（照常转换）：`apps/web/src/components/chat/MessagesTimeline.tsx:2505`（A，AssistantTimelineRow）；`apps/web/src/components/onboarding/WelcomeWizard.tsx:230`（B，WelcomeWizard）
- 同一文本作为值用途字面量出现 1 次：`apps/server/src/cloud/cliAuthHtml.ts:12`（as-const）

### `Version`（B，message，2 处）

- 显示位置（照常转换）：`apps/web/src/components/settings/ConnectionsSettings.tsx:3716`（B，ConnectionsSettings）；`apps/web/src/components/settings/SettingsPanels.tsx:274`（A，AboutVersionTitle）
- 同一文本作为值用途字面量出现 3 次：`apps/desktop/src/snapShot/LinuxSnapShot.ts:55`（object-key）；`apps/desktop/src/snapShot/LinuxSnapShot.ts:56`（object-key）；`apps/desktop/src/snapShot/NiriSnapShot.ts:45`（object-key）

### `Working`（A，message，2 处）

- 显示位置（照常转换）：`apps/web/src/components/CommandPalette.tsx:3360`（A，OpenCommandPaletteDialog）；`apps/web/src/components/Sidebar.tsx:5430`（B，Sidebar）
- 同一文本作为值用途字面量出现 2 次：`apps/web/src/components/Sidebar.logic.ts:628`（ts-type）；`apps/web/src/components/Sidebar.logic.ts:643`（object-key）

### `author`（A，message，2 处）

- 显示位置（照常转换）：`apps/web/src/components/pullRequest/PullRequestSummaryTab.tsx:417`（A，CommentGroup）；`apps/web/src/components/pullRequest/PullRequestTimelineTab.tsx:332`（A，ConversationGroup）
- 同一文本作为值用途字面量出现 103 次：`apps/server/src/orchestration-v2/PullRequestSyncReactor.ts:61`（object-key）；`apps/server/src/orchestration-v2/pullRequestWatch.ts:46`（ts-type）；`apps/server/src/pullRequest/AzureDevOpsPullRequestProvider.ts:129`（object-key）；`apps/server/src/pullRequest/AzureDevOpsPullRequestProvider.ts:340`（object-key）；`apps/server/src/pullRequest/BitbucketPullRequestProvider.ts:99`（object-key）；`apps/server/src/pullRequest/GitHubPullRequestCli.ts:2198`（object-key）；`apps/server/src/pullRequest/GitHubPullRequestProvider.ts:248`（object-key）；`apps/server/src/pullRequest/GitHubPullRequestProvider.ts:309`（object-key）；`apps/server/src/pullRequest/GitHubPullRequestProvider.ts:341`（object-key）；`apps/server/src/pullRequest/GitHubPullRequestProvider.ts:363`（object-key）；…（共 103 处）

### `authors`（A，message，2 处）

- 显示位置（照常转换）：`apps/web/src/components/pullRequest/PullRequestSummaryTab.tsx:417`（A，CommentGroup）；`apps/web/src/components/pullRequest/PullRequestTimelineTab.tsx:332`（A，ConversationGroup）
- 同一文本作为值用途字面量出现 16 次：`apps/server/src/provider/acp/AcpRegistrySupport.ts:138`（object-key）；`apps/server/src/provider/acp/AcpRegistrySupport.ts:1586`（object-key）；`apps/server/src/pullRequest/GitHubPullRequestProvider.ts:460`（object-key）；`apps/server/src/pullRequest/bitbucketPullRequestJson.ts:536`（object-key）；`apps/server/src/pullRequest/forgejoPullRequestJson.ts:204`（object-key）；`apps/server/src/pullRequest/gitHubPullRequestJson.ts:411`（object-key）；`apps/server/src/pullRequest/gitHubPullRequestJson.ts:499`（object-key）；`apps/server/src/pullRequest/gitHubPullRequestJson.ts:661`（object-key）；`apps/server/src/pullRequest/gitHubPullRequestJson.ts:1416`（ts-type）；`apps/server/src/pullRequest/gitHubPullRequestJson.ts:1718`（object-key）；…（共 16 处）

### `comment`（A，message，2 处）

- 显示位置（照常转换）：`apps/web/src/components/pullRequest/PullRequestReviewAnnotation.tsx:229`（A，ReviewThreadCard）；`apps/web/src/components/pullRequest/PullRequestTimelineTab.tsx:329`（A，ConversationGroup）
- 同一文本作为值用途字面量出现 100 次：`apps/desktop/src/preview/PickPreload.ts:1392`（object-key）；`apps/desktop/src/preview/PickedElementPayload.ts:76`（computed-key）；`apps/server/src/pullRequest/AzureDevOpsPullRequestProvider.ts:61`（object-key）；`apps/server/src/pullRequest/AzureDevOpsPullRequestProvider.ts:87`（object-key）；`apps/server/src/pullRequest/AzureDevOpsPullRequestProvider.ts:107`（object-key）；`apps/server/src/pullRequest/AzureDevOpsPullRequestProvider.ts:633`（object-key）；`apps/server/src/pullRequest/BitbucketPullRequestApi.ts:272`（object-key）；`apps/server/src/pullRequest/BitbucketPullRequestApi.ts:847`（object-key）；`apps/server/src/pullRequest/BitbucketPullRequestProvider.ts:17`（object-key）；`apps/server/src/pullRequest/BitbucketPullRequestProvider.ts:33`（object-key）；…（共 100 处）

### `comments`（A，message，2 处）

- 显示位置（照常转换）：`apps/web/src/components/pullRequest/PullRequestReviewAnnotation.tsx:229`（A，ReviewThreadCard）；`apps/web/src/components/pullRequest/PullRequestTimelineTab.tsx:329`（A，ConversationGroup）
- 同一文本作为值用途字面量出现 82 次：`apps/server/src/orchestration-v2/PullRequestWatchReactor.ts:292`（object-key）；`apps/server/src/orchestration-v2/PullRequestWatchReactor.ts:381`（object-key）；`apps/server/src/pullRequest/AzureDevOpsPullRequestProvider.ts:396`（object-key）；`apps/server/src/pullRequest/AzureDevOpsPullRequestProvider.ts:404`（object-key）；`apps/server/src/pullRequest/AzureDevOpsPullRequestProvider.ts:405`（object-key）；`apps/server/src/pullRequest/AzureDevOpsPullRequestProvider.ts:409`（object-key）；`apps/server/src/pullRequest/BitbucketPullRequestApi.ts:224`（object-key）；`apps/server/src/pullRequest/BitbucketPullRequestApi.ts:290`（object-key）；`apps/server/src/pullRequest/BitbucketPullRequestApi.ts:492`（object-key）；`apps/server/src/pullRequest/BitbucketPullRequestApi.ts:496`（object-key）；…（共 82 处）

### `default`（A，message，2 处）

- 显示位置（照常转换）：`apps/web/src/components/settings/EnvironmentIconPicker.tsx:98`（A，EnvironmentIconMenu）；`apps/web/src/components/settings/FontFamilyPicker.tsx:187`（A，renderItem）
- 同一文本作为值用途字面量出现 503 次：`apps/desktop/src/ipc/methods/window.ts:172`（comparison）；`apps/desktop/src/snapShot/RegionSnapShotWorker.ts:9`（object-key）；`apps/server/src/device/DeviceActions.ts:103`（object-key）；`apps/server/src/device/DeviceActions.ts:109`（object-key）；`apps/server/src/mcp/OrchestratorMcpService.ts:913`（as-const）；`apps/server/src/mcp/threadAccess.ts:141`（comparison）；`apps/server/src/orchestration-v2/Adapters/AcpAdapterV2.ts:6237`（comparison）；`apps/server/src/orchestration-v2/Adapters/OpenCode2AdapterV2.ts:780`（comparison）；`apps/server/src/orchestration-v2/Adapters/OpenCode2AdapterV2.ts:780`（comparison）；`apps/server/src/orchestration-v2/DispatchModeLimit.ts:41`（object-key）；…（共 503 处）

### `iOS`（A，message，2 处）

- 显示位置（照常转换）：`apps/web/src/components/RightPanelTabs.tsx:1438`（A，DeviceTabTooltip）；`apps/web/src/components/device/DeviceHostAvailability.tsx:16`（A，DeviceHostAvailability）
- 同一文本作为值用途字面量出现 2 次：`apps/server/src/ws.ts:669`（comparison）；`packages/contracts/src/baseSchemas.ts:352`（schema-literal）

### `on`（A，message，2 处）

- 显示位置（照常转换）：`apps/web/src/components/settings/ScheduledTasksSettings.tsx:1297`（A，ScheduledTaskEditorDialog）；`apps/web/src/components/settings/SettingsScopeSentence.tsx:75`（A，SettingsScopeSentence）
- 同一文本作为值用途字面量出现 25 次：`apps/desktop/src/app/DesktopLifecycle.ts:69`（object-key）；`apps/desktop/src/electron/ElectronApp.ts:79`（object-key）；`apps/desktop/src/electron/ElectronApp.ts:208`（object-key）；`apps/desktop/src/electron/ElectronUpdater.ts:76`（object-key）；`apps/desktop/src/electron/ElectronUpdater.ts:154`（object-key）；`apps/desktop/src/electron/ElectronUpdater.ts:156`（object-key）；`apps/desktop/src/ipc/DesktopIpc.ts:26`（object-key）；`apps/desktop/src/snapShot/snapShot.ts:134`（ts-type）；`apps/desktop/src/snapShot/snapShot.ts:234`（comparison）；`apps/desktop/src/updates/updatesTestHarness.ts:100`（object-key）；…（共 25 处）

### `value`（B，message，2 处）

- 显示位置（照常转换）：`apps/web/src/components/settings/CustomModelEditor.tsx:156`（B，renderChoice）；`apps/web/src/components/settings/ProviderInstanceCard.tsx:417`（B，ProviderEnvironmentSection）
- 同一文本作为值用途字面量出现 815 次：`apps/desktop/src/app/DesktopObservability.ts:113`（object-key）；`apps/desktop/src/app/DesktopObservability.ts:249`（object-key）；`apps/desktop/src/app/DesktopObservability.ts:255`（object-key）；`apps/desktop/src/app/chromiumLocalStorage.ts:269`（object-key）；`apps/desktop/src/app/chromiumLocalStorage.ts:293`（object-key）；`apps/desktop/src/app/chromiumLocalStorage.ts:295`（object-key）；`apps/desktop/src/app/chromiumLocalStorage.ts:353`（object-key）；`apps/desktop/src/preview/BrowserImport/BrowserImport.ts:130`（object-key）；`apps/desktop/src/preview/BrowserImport/ChromiumCookies.ts:82`（object-key）；`apps/desktop/src/preview/BrowserImport/ChromiumCookies.ts:98`（object-key）；…（共 815 处）

### `Add ChatGPT account`（B，message，1 处）

- 显示位置（照常转换）：`apps/web/src/components/settings/AddCodexAccountDialog.tsx:94`（B，AddCodexAccountDialog）
- 同一文本作为值用途字面量出现 1 次：`apps/web/src/components/settings/AddCodexAccountDialog.tsx:39`（non-display-call）

### `Alt`（A，message，1 处）

- 显示位置（照常转换）：`apps/web/src/components/settings/KeybindingsSettings.tsx:102`（A，KeybindingPill）
- 同一文本作为值用途字面量出现 6 次：`apps/desktop/src/preview/RecordingInput.ts:24`（comparison）；`apps/desktop/src/preview/RecordingInput.ts:41`（membership）；`apps/web/src/components/ComposerPromptEditorTiptap.tsx:1377`（comparison）；`apps/web/src/components/settings/useSnapShotShortcutRecorder.tsx:23`（object-key）；`apps/web/src/shortcutModifierState.ts:86`（switch-case）；`packages/contracts/src/previewAutomation.ts:542`（schema-literal）

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

- 显示位置（照常转换）：`apps/web/src/components/settings/ScheduledTasksSettings.tsx:601`（B，WebhookDeliveriesDialog）
- 同一文本作为值用途字面量出现 1 次：`apps/web/src/components/chat/ComposerBanner.tsx:356`（object-key）

### `Commit`（A，message，1 处）

- 显示位置（照常转换）：`apps/web/src/components/GitActionsControl.tsx:2153`（A，GitActionsControl）
- 同一文本作为值用途字面量出现 1 次：`apps/web/src/components/GitActionsControl.tsx:390`（comparison）

### `Copy`（A，message，1 处）

- 显示位置（照常转换）：`apps/web/src/components/settings/ScheduledTasksSettings.tsx:733`（A，WebhookEndpointField）
- 同一文本作为值用途字面量出现 1 次：`apps/web/src/terminal/ghostty/keyCodes.ts:178`（as-const）

### `Count`（A，message，1 处）

- 显示位置（照常转换）：`apps/web/src/components/settings/ResourceTelemetryDiagnostics.tsx:789`（A，AttributionTable）
- 同一文本作为值用途字面量出现 1 次：`apps/web/src/components/chat/ComposerBanner.tsx:355`（object-key）

### `Cursor`（A，message，1 处）

- 显示位置（照常转换）：`apps/web/src/components/usage/UsagePage.tsx:1000`（A，CursorEnableLimits）
- 同一文本作为值用途字面量出现 2 次：`apps/server/src/provider/CursorProvider.ts:27`（as-const）；`apps/server/src/provider/cursorSdk.ts:74`（object-key）

### `Desktop`（B，message，1 处）

- 显示位置（照常转换）：`apps/web/src/components/settings/ResourceTelemetryDiagnostics.tsx:1091`（B，ResourceTelemetryDiagnostics）
- 同一文本作为值用途字面量出现 1 次：`packages/shared/src/previewViewport.ts:11`（ts-type）

### `Device hub`（B，message，1 处）

- 显示位置（照常转换）：`apps/web/src/components/settings/IntegrationsSettings.tsx:803`（B，DeviceIntegrationControls）
- 同一文本作为值用途字面量出现 2 次：`apps/web/src/components/device/DeviceToolVersions.tsx:54`（as-const）；`packages/client-runtime/src/state/device.ts:79`（as-const）

### `Enabled`（A，message，1 处）

- 显示位置（照常转换）：`apps/web/src/components/settings/ScheduledTasksSettings.tsx:1342`（A，ScheduledTaskEditorDialog）
- 同一文本作为值用途字面量出现 1 次：`apps/web/src/components/settings/ResourceTelemetryDiagnostics.tsx:1137`（never-attribute）

### `Encoding`（B，message，1 处）

- 显示位置（照常转换）：`apps/web/src/components/settings/ScheduledTasksSettings.tsx:1242`（B，ScheduledTaskEditorDialog）
- 同一文本作为值用途字面量出现 7 次：`apps/server/src/persistence/Errors.ts:8`（switch-case）；`packages/effect-acp/src/errors.ts:21`（schema-literal）；`packages/effect-acp/src/errors.ts:51`（switch-case）；`packages/effect-codex-app-server/src/errors.ts:14`（schema-literal）；`packages/effect-codex-app-server/src/errors.ts:44`（switch-case）；`packages/shared/src/schemaJson.ts:57`（switch-case）；`packages/shared/src/schemaJson.ts:78`（switch-case）

### `Environment disconnected`（B，message，1 处）

- 显示位置（照常转换）：`apps/web/src/components/settings/ScheduledTasksSettings.tsx:366`（B，ScheduledTaskEnvironmentSection）
- 同一文本作为值用途字面量出现 3 次：`apps/web/src/components/settings/DeviceHostsSettings.tsx:46`（error-constructor）；`apps/web/src/components/settings/IntegrationsSettings.tsx:691`（error-constructor）；`apps/web/src/components/settings/deviceHostConnectionChecks.ts:49`（error-constructor）

### `Failed`（A，message，1 处）

- 显示位置（照常转换）：`apps/web/src/components/settings/DeviceHostEditor.tsx:184`（A，DeviceHostEditor）
- 同一文本作为值用途字面量出现 13 次：`apps/desktop/src/backend/DesktopBackendConfiguration.ts:303`（ts-type）；`apps/desktop/src/backend/DesktopBackendConfiguration.ts:348`（as-const）；`apps/desktop/src/backend/DesktopBackendConfiguration.ts:360`（as-const）；`apps/desktop/src/backend/DesktopBackendConfiguration.ts:374`（as-const）；`apps/desktop/src/backend/DesktopBackendConfiguration.ts:390`（as-const）；`apps/desktop/src/backend/DesktopBackendConfiguration.ts:433`（as-const）；`apps/desktop/src/backend/DesktopBackendConfiguration.ts:472`（as-const）；`apps/desktop/src/backend/DesktopBackendConfiguration.ts:783`（comparison）；`apps/server/src/orchestration-v2/Adapters/AcpAdapterV2.ts:1224`（ts-type）；`apps/server/src/orchestration-v2/Adapters/AcpAdapterV2.ts:1720`（comparison）；…（共 13 处）

### `HEAD`（A，message，1 处）

- 显示位置（照常转换）：`apps/web/src/components/DiffPanel.tsx:806`（A，DiffPanel）
- 同一文本作为值用途字面量出现 15 次：`apps/desktop/src/electron/ElectronProtocol.ts:205`（comparison）；`apps/desktop/src/electron/ElectronProtocol.ts:210`（comparison）；`apps/desktop/src/electron/ElectronProtocol.ts:227`（comparison）；`apps/desktop/src/electron/ElectronProtocol.ts:250`（comparison）；`apps/server/src/device/DeviceHubProxy.ts:129`（comparison）；`apps/server/src/device/DeviceHubProxy.ts:164`（comparison）；`apps/server/src/http.ts:171`（ts-type）；`apps/server/src/http.ts:218`（comparison）；`apps/server/src/http.ts:440`（comparison）；`apps/server/src/storageCleanup.ts:362`（comparison）；…（共 15 处）

### `Home`（B，message，1 处）

- 显示位置（照常转换）：`apps/web/src/components/device/DeviceControlsRail.tsx:65`（B，DeviceControlsRail）
- 同一文本作为值用途字面量出现 13 次：`apps/web/src/components/ChatView.tsx:6577`（membership）；`apps/web/src/components/ChatView.tsx:6579`（membership）；`apps/web/src/components/ChatView.tsx:6587`（switch-case）；`apps/web/src/components/ComposerPromptEditorTiptap.tsx:880`（comparison）；`apps/web/src/components/ComposerPromptEditorTiptap.tsx:896`（comparison）；`apps/web/src/components/chat/MessagesTimeline.tsx:840`（membership）；`apps/web/src/components/chat/MessagesTimeline.tsx:1598`（comparison）；`apps/web/src/components/chat/composerScrollGesture.ts:16`（switch-case）；`apps/web/src/components/chat/useAssistantCitationTarget.ts:158`（membership）；`apps/web/src/components/ui/color-picker.tsx:101`（switch-case）；…（共 13 处）

### `Icon`（A，message，1 处）

- 显示位置（照常转换）：`apps/web/src/components/settings/EnvironmentIconPicker.tsx:71`（A，EnvironmentIconMenu）
- 同一文本作为值用途字面量出现 120 次：`apps/web/src/components/ChatMarkdown.tsx:577`（object-key）；`apps/web/src/components/ChatMarkdown.tsx:581`（object-key）；`apps/web/src/components/ChatMarkdown.tsx:587`（object-key）；`apps/web/src/components/ChatMarkdown.tsx:593`（object-key）；`apps/web/src/components/ChatMarkdown.tsx:599`（object-key）；`apps/web/src/components/ChatMarkdown.tsx:605`（object-key）；`apps/web/src/components/GitActionsControl.tsx:208`（object-key）；`apps/web/src/components/GitActionsControl.tsx:216`（object-key）；`apps/web/src/components/GitActionsControl.tsx:224`（object-key）；`apps/web/src/components/GitActionsControl.tsx:232`（object-key）；…（共 120 处）

### `Idle`（B，message，1 处）

- 显示位置（照常转换）：`apps/web/src/components/settings/ResourceTelemetryDiagnostics.tsx:1142`（B，ResourceTelemetryDiagnostics）
- 同一文本作为值用途字面量出现 25 次：`apps/desktop/src/preview/Manager.ts:85`（ts-type）；`apps/desktop/src/preview/Manager.ts:1294`（comparison）；`apps/desktop/src/preview/Manager.ts:1998`（comparison）；`apps/server/src/orchestration-v2/Adapters/AcpAdapterV2.ts:1219`（ts-type）；`apps/server/src/orchestration-v2/Adapters/AcpAdapterV2.ts:1730`（comparison）；`apps/server/src/orchestration-v2/Adapters/AcpAdapterV2.ts:7239`（comparison）；`apps/server/src/preview/Manager.ts:267`（comparison）；`apps/web/src/browser/ElectronBrowserHost.tsx:99`（comparison）；`apps/web/src/components/RightPanelTabs.tsx:608`（comparison）；`apps/web/src/components/RightPanelTabs.tsx:656`（comparison）；…（共 25 处）

### `Interrupt`（A，message，1 处）

- 显示位置（照常转换）：`apps/web/src/components/chat/ComposerPrimaryActions.tsx:148`（A，renderStopGenerationButton）
- 同一文本作为值用途字面量出现 5 次：`packages/effect-acp/src/protocol.ts:252`（comparison）；`packages/effect-acp/src/protocol.ts:656`（switch-case）；`packages/effect-codex-app-server/src/_generated/schema.gen.ts:52057`（object-key）；`packages/effect-codex-app-server/src/_generated/schema.gen.ts:52073`（object-key）；`packages/shared/src/schemaJson.ts:139`（switch-case）

### `Mode`（A，message，1 处）

- 显示位置（照常转换）：`apps/web/src/components/chat/CompactComposerControlsMenu.tsx:64`（A，CompactComposerControlsMenu）
- 同一文本作为值用途字面量出现 1 次：`packages/shared/src/qrCode.ts:763`（object-key）

### `Path`（A，message，1 处）

- 显示位置（照常转换）：`apps/web/src/components/chat/WorktreeSetupCard.tsx:278`（A，SetupDetails）
- 同一文本作为值用途字面量出现 3 次：`apps/server/src/cli/update.ts:204`（computed-key）；`apps/server/src/process/externalLauncher.ts:117`（object-key）；`apps/server/src/provider/providerMaintenance.ts:52`（object-key）

### `Projects`（A，message，1 处）

- 显示位置（照常转换）：`apps/web/src/components/LegacySidebar.tsx:3115`（A，SidebarProjectsContent）
- 同一文本作为值用途字面量出现 1 次：`apps/web/src/components/onboarding/WelcomeWizard.tsx:111`（as-const）

### `Remove route`（A，message，1 处）

- 显示位置（照常转换）：`apps/web/src/components/settings/EnvironmentRoutesList.tsx:217`（A，SortableRouteRow）
- 同一文本作为值用途字面量出现 1 次：`apps/web/src/components/settings/EnvironmentRoutesList.tsx:71`（non-display-call）

### `Skipped`（A，message，1 处）

- 显示位置（照常转换）：`apps/web/src/components/settings/BrowserImportWizard.tsx:568`（A，DoneStep）
- 同一文本作为值用途字面量出现 2 次：`apps/server/src/project/AgentSessionImporter.ts:221`（comparison）；`apps/server/src/project/AgentSessionScanner.ts:179`（ts-type）

### `Snoozed`（B，message，1 处）

- 显示位置（照常转换）：`apps/web/src/components/Sidebar.tsx:5448`（B，Sidebar）
- 同一文本作为值用途字面量出现 1 次：`apps/web/src/hooks/showThreadUndoNotice.ts:12`（ts-type）

### `This connection cannot read host files.`（A，message，1 处）

- 显示位置（照常转换）：`apps/web/src/components/files/FilePreviewPanel.tsx:1220`（A，FilePreviewPanel）
- 同一文本作为值用途字面量出现 1 次：`apps/web/src/components/media/MediaActions.tsx:74`（error-constructor）

### `Type`（A，message，1 处）

- 显示位置（照常转换）：`apps/web/src/components/settings/DiagnosticsSettings.tsx:372`（A，ProcessDiagnosticsTable）
- 同一文本作为值用途字面量出现 18 次：`apps/server/src/sourceControl/AzureDevOpsCli.ts:338`（ts-type）；`apps/server/src/sourceControl/BitbucketApi.ts:694`（ts-type）；`apps/server/src/sourceControl/BitbucketApi.ts:714`（ts-type）；`apps/server/src/textGeneration/ClaudeTextGeneration.ts:113`（ts-type）；`apps/server/src/textGeneration/CodexTextGeneration.ts:150`（ts-type）；`apps/server/src/textGeneration/TextGenerationOperations.ts:45`（ts-type）；`packages/contracts/src/baseSchemas.ts:160`（ts-type）；`packages/contracts/src/baseSchemas.ts:161`（ts-type）；`packages/contracts/src/baseSchemas.ts:172`（ts-type）；`packages/contracts/src/baseSchemas.ts:232`（ts-type）；…（共 18 处）

### `Unknown`（A，message，1 处）

- 显示位置（照常转换）：`apps/web/src/components/device/DeviceToolsPanel.tsx:394`（A，ChoiceSelect）
- 同一文本作为值用途字面量出现 5 次：`apps/server/src/project/AgentSessionJson.ts:33`（switch-case）；`apps/server/src/provider/Drivers/CodexHomeLayout.ts:149`（comparison）；`apps/web/src/components/settings/ResourceTelemetryDiagnostics.tsx:1071`（never-attribute）；`packages/contracts/src/resourceTelemetry.ts:240`（schema-literal）；`packages/shared/src/symlink.ts:43`（error-constructor）

### `Worktree`（A，message，1 处）

- 显示位置（照常转换）：`apps/web/src/components/PullRequestThreadDialog.tsx:328`（A，PullRequestThreadDialog）
- 同一文本作为值用途字面量出现 3 次：`apps/server/src/project/AgentSessionScanner.ts:701`（ts-type）；`apps/server/src/project/AgentSessionScanner.ts:715`（as-const）；`apps/server/src/project/AgentSessionScanner.ts:1242`（comparison）

### `and`（A，message，1 处）

- 显示位置（照常转换）：`apps/web/src/components/settings/KeybindingsSettings.tsx:510`（A，WhenExpressionNodeEditor）
- 同一文本作为值用途字面量出现 13 次：`apps/server/src/keybindings.ts:185`（switch-case）；`apps/web/src/components/settings/KeybindingsSettings.logic.ts:103`（switch-case）；`apps/web/src/components/settings/KeybindingsSettings.logic.ts:317`（switch-case）；`apps/web/src/components/settings/KeybindingsSettings.tsx:150`（ts-type）；`apps/web/src/components/settings/KeybindingsSettings.tsx:487`（comparison）；`apps/web/src/components/settings/KeybindingsSettings.tsx:510`（never-attribute）；`apps/web/src/keybindings.ts:78`（switch-case）；`packages/client-runtime/src/work-log/commandLabel.ts:76`（membership）；`packages/client-runtime/src/work-log/commandLabel.ts:166`（membership）；`packages/contracts/src/keybindings.ts:180`（schema-literal）；…（共 13 处）

### `approval`（A，message，1 处）

- 显示位置（照常转换）：`apps/web/src/components/pullRequest/PullRequestDetailPanel.tsx:2675`（A，PullRequestDetailPanel）
- 同一文本作为值用途字面量出现 20 次：`apps/server/src/orchestration-v2/Adapters/AcpAdapterV2.ts:1446`（ts-type）；`apps/server/src/orchestration-v2/Adapters/AcpAdapterV2.ts:5023`（comparison）；`apps/server/src/orchestration-v2/Adapters/AcpAdapterV2.ts:7215`（comparison）；`apps/server/src/orchestration-v2/Adapters/ClaudeAdapterV2.ts:2887`（ts-type）；`apps/server/src/orchestration-v2/Adapters/CodexAdapterV2.ts:1215`（ts-type）；`apps/web/src/components/Sidebar.logic.ts:955`（ts-type）；`apps/web/src/components/Sidebar.logic.ts:972`（comparison）；`apps/web/src/components/Sidebar.logic.ts:1006`（ts-type）；`apps/web/src/components/Sidebar.logic.ts:1026`（comparison）；`apps/web/src/components/Sidebar.tsx:1264`（comparison）；…（共 20 处）

### `approvals`（A，message，1 处）

- 显示位置（照常转换）：`apps/web/src/components/pullRequest/PullRequestDetailPanel.tsx:2675`（A，PullRequestDetailPanel）
- 同一文本作为值用途字面量出现 12 次：`apps/server/src/orchestration-v2/Adapters/AcpAdapterV2.ts:582`（object-key）；`apps/server/src/orchestration-v2/Adapters/ClaudeAdapterV2.ts:221`（object-key）；`apps/server/src/orchestration-v2/Adapters/CodexAdapterV2.ts:279`（object-key）；`apps/server/src/orchestration-v2/Adapters/CursorAdapterV2.ts:126`（object-key）；`apps/server/src/orchestration-v2/Adapters/OpenCode2AdapterV2.ts:149`（object-key）；`apps/server/src/orchestration-v2/Adapters/OpenCodeAdapterV2.ts:166`（object-key）；`apps/server/src/orchestration-v2/Adapters/PiAdapterV2.ts:164`（object-key）；`apps/web/src/components/ChatView.tsx:3296`（object-key）；`apps/web/src/components/clerk/MobileClientsUserProfilePage.logic.ts:9`（as-const）；`packages/client-runtime/src/state/threadRequests.ts:40`（object-key）；…（共 12 处）

### `auto-settle`（B，message，1 处）

- 显示位置（照常转换）：`apps/web/src/components/settings/SettingsPanels.tsx:2441`（B，GeneralSettingsPanel）
- 同一文本作为值用途字面量出现 2 次：`apps/web/src/components/threadActionMenu.logic.ts:17`（ts-type）；`apps/web/src/components/threadActionMenu.logic.ts:201`（as-const）

### `available`（A，message，1 处）

- 显示位置（照常转换）：`apps/web/src/components/device/DeviceHostAvailability.tsx:17`（A，DeviceHostAvailability）
- 同一文本作为值用途字面量出现 108 次：`apps/desktop/src/ipc/methods/wsl.ts:32`（object-key）；`apps/desktop/src/snapShot/DesktopSnapShot.ts:695`（object-key）；`apps/desktop/src/snapShot/DesktopSnapShot.ts:700`（object-key）；`apps/desktop/src/snapShot/DesktopSnapShot.ts:702`（object-key）；`apps/desktop/src/snapShot/DesktopSnapShot.ts:1014`（object-key）；`apps/desktop/src/snapShot/DesktopSnapShot.ts:1018`（object-key）；`apps/desktop/src/snapShot/DesktopSnapShot.ts:1024`（object-key）；`apps/desktop/src/snapShot/DesktopSnapShot.ts:1030`（object-key）；`apps/desktop/src/snapShot/DesktopSnapShot.ts:1044`（object-key）；`apps/desktop/src/snapShot/DesktopSnapShot.ts:1051`（object-key）；…（共 108 处）

### `base64`（A，message，1 处）

- 显示位置（照常转换）：`apps/web/src/components/settings/ScheduledTasksSettings.tsx:1257`（A，ScheduledTaskEditorDialog）
- 同一文本作为值用途字面量出现 13 次：`apps/desktop/src/preview/FaviconCapture.ts:219`（comparison）；`apps/desktop/src/preview/FaviconCapture.ts:220`（membership）；`apps/desktop/src/preview/FaviconCapture.ts:227`（comparison）；`apps/server/src/htmlRender/HtmlRender.ts:298`（as-const）；`apps/server/src/imageMime.ts:56`（object-key）；`apps/server/src/imageMime.ts:76`（comparison）；`apps/server/src/imageMime.ts:113`（object-key）；`apps/server/src/pullRequest/ForgejoPullRequestProvider.ts:414`（schema-literal）；`apps/web/src/components/settings/ScheduledTasksSettings.tsx:1248`（comparison）；`apps/web/src/components/settings/ScheduledTasksSettings.tsx:1257`（never-attribute）；…（共 13 处）

### `cost`（A，message，1 处）

- 显示位置（照常转换）：`apps/web/src/components/usage/UsagePage.tsx:627`（A，UsagePage）
- 同一文本作为值用途字面量出现 30 次：`apps/server/src/provider/acp/AcpRuntimeModel.ts:1589`（object-key）；`apps/server/src/sourceControl/GitHubApi.ts:225`（object-key）；`apps/server/src/sourceControl/githubGraphQlBudget.ts:14`（object-key）；`apps/server/src/sourceControl/githubGraphQlBudget.ts:46`（object-key）；`apps/server/src/sourceControl/githubGraphQlBudget.ts:62`（object-key）；`apps/server/src/sourceControl/githubGraphQlBudget.ts:140`（object-key）；`apps/server/src/textGeneration/OpenCode2TextGeneration.fixture.ts:44`（object-key）；`apps/server/src/textGeneration/OpenCode2TextGeneration.fixture.ts:321`（object-key）；`apps/server/src/textGeneration/OpenCode2TextGeneration.fixture.ts:341`（object-key）；`apps/web/src/components/usage/UsagePage.tsx:520`（comparison）；…（共 30 处）

### `custom`（A，message，1 处）

- 显示位置（照常转换）：`apps/web/src/components/settings/ProviderModelsSection.tsx:491`（A，renderRow）
- 同一文本作为值用途字面量出现 77 次：`apps/server/src/git/GitManager.ts:791`（switch-case）；`apps/server/src/orchestration-v2/ThreadLaunchService.ts:301`（comparison）；`apps/server/src/textGeneration/TextGenerationPolicy.ts:7`（schema-literal）；`apps/server/src/textGeneration/TextGenerationPrompts.ts:195`（comparison）；`apps/server/src/textGeneration/TextGenerationPrompts.ts:214`（comparison）；`apps/web/src/components/settings/BranchNamingSettings.tsx:19`（object-key）；`apps/web/src/components/settings/BranchNamingSettings.tsx:118`（comparison）；`apps/web/src/components/settings/SettingInheritance.tsx:34`（object-key）；`apps/web/src/components/settings/SettingsPanels.logic.ts:193`（comparison）；`apps/web/src/components/settings/SettingsPanels.logic.ts:205`（comparison）；…（共 77 处）

### `days`（A，message，1 处）

- 显示位置（照常转换）：`apps/web/src/components/settings/StorageSettings.tsx:130`（A，RetentionControl）
- 同一文本作为值用途字面量出现 24 次：`apps/server/src/auth/EnvironmentAuth.ts:806`（object-key）；`apps/server/src/scheduledTasks/Schedule.ts:30`（object-key）；`apps/web/src/components/CustomSnoozeDialog.tsx:64`（ts-type）；`apps/web/src/components/CustomSnoozeDialog.tsx:189`（object-key）；`apps/web/src/components/CustomSnoozeDialog.tsx:191`（comparison）；`apps/web/src/components/CustomSnoozeDialog.tsx:202`（never-attribute）；`apps/web/src/components/usage/UsageModelDialog.tsx:29`（object-key）；`apps/web/src/components/usage/UsagePage.tsx:125`（object-key）；`apps/web/src/components/usage/UsagePage.tsx:142`（object-key）；`apps/web/src/components/usage/UsagePage.tsx:226`（object-key）；…（共 24 处）

### `folder`（A，message，1 处）

- 显示位置（照常转换）：`apps/web/src/components/onboarding/WelcomeWizard.tsx:1614`（A，ImportCandidateList）
- 同一文本作为值用途字面量出现 10 次：`apps/server/src/project/ManagedProjectFolders.ts:45`（object-key）；`apps/server/src/project/ManagedProjectFolders.ts:71`（object-key）；`apps/server/src/project/ManagedProjectFolders.ts:280`（object-key）；`apps/server/src/project/ManagedProjectFolders.ts:367`（object-key）；`apps/server/src/project/ManagedProjectFolders.ts:369`（object-key）；`apps/server/src/project/ManagedProjectFolders.ts:385`（object-key）；`apps/server/src/project/ManagedProjectFolders.ts:401`（object-key）；`apps/server/src/project/ManagedProjectFolders.ts:405`（object-key）；`apps/server/src/project/ManagedProjectFolders.ts:464`（object-key）；`apps/web/src/contextMenuFallback.ts:40`（object-key）

### `folders`（A，message，1 处）

- 显示位置（照常转换）：`apps/web/src/components/onboarding/WelcomeWizard.tsx:1614`（A，ImportCandidateList）
- 同一文本作为值用途字面量出现 4 次：`apps/web/src/components/chat/workspaceFileDrop.ts:35`（object-key）；`apps/web/src/components/chat/workspaceFileDrop.ts:38`（object-key）；`apps/web/src/components/chat/workspaceFileDrop.ts:52`（object-key）；`apps/web/src/components/chat/workspaceFileDrop.ts:79`（object-key）

### `gh auth login`（A，message，1 处）

- 显示位置（照常转换）：`apps/web/src/components/settings/GitHubAccountSettings.tsx:79`（A，GitHubAccountSettings）
- 同一文本作为值用途字面量出现 1 次：`apps/server/src/vcs/VcsProcess.ts:71`（membership）

### `ghost`（A，message，1 处）

- 显示位置（照常转换）：`apps/web/src/components/pullRequest/PullRequestTimelineTab.tsx:93`（A，ActorName）
- 同一文本作为值用途字面量出现 12 次：`apps/web/src/components/chat/MessageCopyButton.tsx:25`（ts-type）；`apps/web/src/components/chat/MessageCopyButton.tsx:47`（comparison）；`apps/web/src/components/pullRequest/PullRequestSummaryTab.tsx:384`（never-attribute）；`apps/web/src/components/ui/button.tsx:48`（object-key）；`apps/web/src/components/ui/input-group.tsx:19`（object-key）；`apps/web/src/components/ui/menu.tsx:83`（ts-type）；`apps/web/src/components/ui/menu.tsx:89`（comparison）；`apps/web/src/components/ui/menu.tsx:91`（non-display-call）；`apps/web/src/components/ui/select.tsx:24`（object-key）；`apps/web/src/components/ui/toast.tsx:51`（ts-type）；…（共 12 处）

### `hex`（A，message，1 处）

- 显示位置（照常转换）：`apps/web/src/components/settings/ScheduledTasksSettings.tsx:1256`（A，ScheduledTaskEditorDialog）
- 同一文本作为值用途字面量出现 9 次：`apps/server/src/preview/PreviewBrowser.ts:243`（comparison）；`apps/server/src/provider/AntigravityInstallation.ts:543`（comparison）；`apps/server/src/provider/CodexInstallation.ts:504`（comparison）；`apps/server/src/scheduledTasks/webhookVerification.ts:31`（comparison）；`apps/server/src/scheduledTasks/webhookVerification.ts:34`（comparison）；`apps/web/src/components/settings/ScheduledTasksSettings.tsx:1256`（never-attribute）；`apps/web/src/components/settings/scheduledTasksSettings.logic.ts:78`（ts-type）；`apps/web/src/components/settings/scheduledTasksSettings.logic.ts:89`（as-const）；`packages/contracts/src/scheduledTask.ts:63`（schema-literal）

### `left`（A，message，1 处）

- 显示位置（照常转换）：`apps/web/src/components/usage/UsageLimitsPooled.tsx:515`（A，PoolWindowCard）
- 同一文本作为值用途字面量出现 136 次：`apps/desktop/src/preview/PickPreload.ts:621`（object-key）；`apps/desktop/src/preview/PickPreload.ts:971`（object-key）；`apps/desktop/src/preview/PickPreload.ts:975`（object-key）；`apps/desktop/src/preview/PickPreload.ts:986`（object-key）；`apps/desktop/src/preview/PickPreload.ts:1013`（object-key）；`apps/desktop/src/preview/PickPreload.ts:1014`（object-key）；`apps/desktop/src/preview/PickPreload.ts:1016`（object-key）；`apps/desktop/src/preview/PickPreload.ts:1020`（object-key）；`apps/desktop/src/preview/PickPreload.ts:1024`（object-key）；`apps/desktop/src/preview/PickPreload.ts:1050`（object-key）；…（共 136 处）

### `minutes`（A，message，1 处）

- 显示位置（照常转换）：`apps/web/src/components/settings/ScheduledTasksSettings.tsx:1335`（A，ScheduledTaskEditorDialog）
- 同一文本作为值用途字面量出现 11 次：`apps/server/src/cli/trace.ts:107`（object-key）；`apps/server/src/cloud/CloudLink.ts:643`（object-key）；`apps/server/src/cloud/CloudLink.ts:1515`（object-key）；`apps/server/src/orchestration-v2/PullRequestWatchReactor.ts:274`（object-key）；`apps/server/src/relay/AgentAwarenessRelay.ts:261`（object-key）；`apps/web/src/components/CustomSnoozeDialog.tsx:64`（ts-type）；`apps/web/src/components/CustomSnoozeDialog.tsx:189`（object-key）；`apps/web/src/components/CustomSnoozeDialog.tsx:191`（comparison）；`apps/web/src/components/CustomSnoozeDialog.tsx:200`（never-attribute）；`packages/client-runtime/src/state/threadSettled.ts:326`（ts-type）；…（共 11 处）

### `none`（A，message，1 处）

- 显示位置（照常转换）：`apps/web/src/components/GitActionsControl.tsx:2042`（A，GitActionsControl）
- 同一文本作为值用途字面量出现 133 次：`apps/desktop/src/electron/ElectronDialog.ts:42`（schema-literal）；`apps/desktop/src/preview/FaviconCapture.ts:37`（ts-type）；`apps/desktop/src/preview/Manager.ts:109`（ts-type）；`apps/desktop/src/preview/PickPreload.ts:64`（comparison）；`apps/desktop/src/preview/PickPreload.ts:84`（comparison）；`apps/desktop/src/preview/PickPreload.ts:1039`（comparison）；`apps/desktop/src/preview/RecordingCursor.ts:44`（ts-type）；`apps/server/src/auth/mcpOAuthHttp.ts:83`（as-const）；`apps/server/src/cloud/managedTunnelStartup.ts:14`（ts-type）；`apps/server/src/device/DeviceActions.ts:527`（comparison）；…（共 133 处）

### `now`（A，message，1 处）

- 显示位置（照常转换）：`apps/web/src/components/chat/ComposerTasksBadge.tsx:209`（A，ComposerTasksContent）
- 同一文本作为值用途字面量出现 153 次：`apps/server/src/auth/PairingGrantStore.ts:358`（object-key）；`apps/server/src/auth/PairingGrantStore.ts:570`（object-key）；`apps/server/src/auth/SessionStore.ts:974`（object-key）；`apps/server/src/background/BackgroundPolicy.ts:184`（object-key）；`apps/server/src/background/BackgroundPolicy.ts:231`（object-key）；`apps/server/src/mcp/McpSessionRegistry.ts:65`（object-key）；`apps/server/src/orchestration-v2/Adapters/AcpAdapterV2.ts:758`（object-key）；`apps/server/src/orchestration-v2/Adapters/AcpAdapterV2.ts:2628`（object-key）；`apps/server/src/orchestration-v2/Adapters/AcpAdapterV2.ts:2780`（object-key）；`apps/server/src/orchestration-v2/Adapters/AcpAdapterV2.ts:2798`（object-key）；…（共 153 处）

### `optionId`（B，message，1 处）

- 显示位置（照常转换）：`apps/web/src/components/settings/CustomModelEditor.tsx:233`（B，renderDescriptor）
- 同一文本作为值用途字面量出现 19 次：`apps/server/src/orchestration-v2/Adapters/AcpAdapterV2.ts:5649`（object-key）；`apps/server/src/orchestration-v2/Adapters/AcpAdapterV2.ts:5659`（object-key）；`apps/server/src/orchestration-v2/Adapters/AcpAdapterV2.ts:5733`（object-key）；`apps/server/src/orchestration-v2/Adapters/AcpAdapterV2.ts:6325`（object-key）；`apps/server/src/provider/acp/AntigravityProtocol.ts:172`（object-key）；`apps/server/src/provider/acp/AntigravityProtocol.ts:176`（object-key）；`apps/web/src/components/chat/ComposerCommandMenu.tsx:161`（object-key）；`packages/effect-acp/src/_generated/schema-v1.gen.ts:3112`（object-key）；`packages/effect-acp/src/_generated/schema-v1.gen.ts:3122`（object-key）；`packages/effect-acp/src/_generated/schema-v1.gen.ts:3141`（object-key）；…（共 19 处）

### `or`（A，message，1 处）

- 显示位置（照常转换）：`apps/web/src/components/settings/KeybindingsSettings.tsx:511`（A，WhenExpressionNodeEditor）
- 同一文本作为值用途字面量出现 13 次：`apps/server/src/keybindings.ts:187`（switch-case）；`apps/web/src/components/settings/KeybindingsSettings.logic.ts:105`（switch-case）；`apps/web/src/components/settings/KeybindingsSettings.logic.ts:318`（switch-case）；`apps/web/src/components/settings/KeybindingsSettings.tsx:150`（ts-type）；`apps/web/src/components/settings/KeybindingsSettings.tsx:435`（comparison）；`apps/web/src/components/settings/KeybindingsSettings.tsx:511`（never-attribute）；`apps/web/src/keybindings.ts:80`（switch-case）；`packages/client-runtime/src/work-log/commandLabel.ts:128`（membership）；`packages/client-runtime/src/work-log/commandLabel.ts:191`（membership）；`packages/contracts/src/keybindings.ts:185`（schema-literal）；…（共 13 处）

### `origin`（B，message，1 处）

- 显示位置（照常转换）：`apps/web/src/components/GitActionsControl.tsx:926`（B，PublishRepositoryDialog）
- 同一文本作为值用途字面量出现 108 次：`apps/desktop/src/electron/ElectronProtocol.ts:187`（comparison）；`apps/server/src/cli/pair.ts:177`（object-key）；`apps/server/src/cli/pair.ts:534`（object-key）；`apps/server/src/cli/project.ts:353`（object-key）；`apps/server/src/cli/project.ts:359`（object-key）；`apps/server/src/cli/project.ts:370`（object-key）；`apps/server/src/cli/project.ts:374`（object-key）；`apps/server/src/cli/sshHelper.ts:101`（object-key）；`apps/server/src/cloud/CloudLink.ts:168`（object-key）；`apps/server/src/cloud/CloudLink.ts:406`（object-key）；…（共 108 处）

### `outdated`（A，message，1 处）

- 显示位置（照常转换）：`apps/web/src/components/pullRequest/PullRequestReviewAnnotation.tsx:231`（A，ReviewThreadCard）
- 同一文本作为值用途字面量出现 1 次：`apps/server/src/pullRequest/bitbucketPullRequestJson.ts:114`（object-key）

### `override`（B，message，1 处）

- 显示位置（照常转换）：`apps/web/src/components/settings/settingsLayout.tsx:358`（B，SettingsRow）
- 同一文本作为值用途字面量出现 4 次：`apps/server/src/provider/AntigravityInstallation.ts:79`（ts-type）；`apps/server/src/provider/AntigravityInstallation.ts:251`（ts-type）；`packages/contracts/src/relayClient.ts:7`（schema-literal）；`packages/shared/src/relayClient.ts:25`（ts-type）

### `process`（A，message，1 处）

- 显示位置（照常转换）：`apps/web/src/components/settings/ResourceTelemetryDiagnostics.tsx:291`（A，AggregateCard）
- 同一文本作为值用途字面量出现 39 次：`apps/desktop/src/wsl/DesktopWslEnvironment.ts:160`（ts-type）；`apps/desktop/src/wsl/DesktopWslEnvironment.ts:179`（switch-case）；`apps/server/src/resourceTelemetry/Model.ts:17`（object-key）；`apps/server/src/resourceTelemetry/Model.ts:563`（object-key）；`apps/server/src/resourceTelemetry/ResourceTelemetryHistory.ts:45`（object-key）；`apps/server/src/resourceTelemetry/ResourceTelemetryHistory.ts:266`（object-key）；`apps/server/src/serviceLauncher.ts:43`（object-key）；`apps/server/src/serviceLauncher.ts:450`（object-key）；`apps/server/src/sourceControl/ForgejoSourceControlProvider.ts:90`（object-key）；`apps/server/src/sourceControl/ForgejoSourceControlProvider.ts:136`（object-key）；…（共 39 处）

### `processes`（A，message，1 处）

- 显示位置（照常转换）：`apps/web/src/components/settings/ResourceTelemetryDiagnostics.tsx:291`（A，AggregateCard）
- 同一文本作为值用途字面量出现 20 次：`apps/server/src/diagnostics/ProcessDiagnostics.ts:84`（object-key）；`apps/server/src/resourceTelemetry/Model.ts:59`（object-key）；`apps/server/src/resourceTelemetry/Model.ts:597`（object-key）；`apps/server/src/resourceTelemetry/NativeTelemetryClient.ts:680`（object-key）；`apps/server/src/resourceTelemetry/NativeTelemetryClient.ts:853`（object-key）；`apps/server/src/resourceTelemetry/ResourceTelemetry.ts:187`（object-key）；`apps/server/src/resourceTelemetry/ResourceTelemetry.ts:300`（object-key）；`apps/web/src/components/settings/DiagnosticsSettings.tsx:302`（object-key）；`apps/web/src/components/settings/DiagnosticsSettings.tsx:308`（object-key）；`apps/web/src/components/settings/DiagnosticsSettings.tsx:561`（object-key）；…（共 20 处）

### `root`（B，message，1 处）

- 显示位置（照常转换）：`apps/web/src/components/settings/ConnectionsSettings.tsx:3164`（B，renderSshFields）
- 同一文本作为值用途字面量出现 103 次：`apps/desktop/src/snapShot/SnapShotAccessibility.ts:46`（ts-type）；`apps/desktop/src/snapShot/SnapShotAccessibility.ts:74`（object-key）；`apps/desktop/src/snapShot/SnapShotAccessibility.ts:88`（object-key）；`apps/desktop/src/snapShot/snapShot.ts:304`（object-key）；`apps/desktop/src/snapShot/snapShot.ts:340`（object-key）；`apps/desktop/src/snapShot/snapShot.ts:359`（object-key）；`apps/desktop/src/snapShot/snapShot.ts:439`（object-key）；`apps/desktop/src/wsl/DesktopWslServerTree.ts:24`（object-key）；`apps/desktop/src/wsl/DesktopWslServerTree.ts:206`（object-key）；`apps/desktop/src/wsl/DesktopWslServerTree.ts:210`（object-key）；…（共 103 处）

### `server`（B，message，1 处）

- 显示位置（照常转换）：`apps/web/src/components/settings/ConnectionsSettings.tsx:3737`（B，ConnectionsSettings）
- 同一文本作为值用途字面量出现 195 次：`apps/desktop/src/app/DesktopAppActivation.ts:218`（object-key）；`apps/desktop/src/app/DesktopAppActivation.ts:232`（object-key）；`apps/desktop/src/app/DesktopAppActivation.ts:252`（object-key）；`apps/server/src/cli/triage.ts:199`（object-key）；`apps/server/src/cli/triagePrompt.ts:174`（object-key）；`apps/server/src/diagnostics/ProcessResourceMonitor.ts:24`（comparison）；`apps/server/src/diagnostics/ProcessResourceMonitor.ts:45`（comparison）；`apps/server/src/htmlRender/publicProxy.ts:149`（object-key）；`apps/server/src/htmlRender/publicProxy.ts:231`（object-key）；`apps/server/src/htmlRender/publicProxy.ts:234`（object-key）；…（共 195 处）

### `setup`（A，message，1 处）

- 显示位置（照常转换）：`apps/web/src/components/settings/ProjectActionsList.tsx:38`（A，ProjectActionsList）
- 同一文本作为值用途字面量出现 13 次：`apps/desktop/src/snapShot/DesktopSnapShot.ts:175`（object-key）；`apps/desktop/src/snapShot/DesktopSnapShot.ts:1518`（object-key）；`apps/server/src/provider/AntigravityProvider.ts:155`（object-key）；`apps/server/src/provider/Drivers/AcpRegistryDriver.ts:228`（object-key）；`apps/server/src/provider/Drivers/CodexManagedProvider.ts:56`（object-key）；`apps/server/src/provider/Drivers/CodexManagedProvider.ts:150`（object-key）；`apps/server/src/provider/Drivers/CursorDriver.ts:143`（object-key）；`apps/web/src/components/files/useFileSaveCoordinator.ts:35`（object-key）；`apps/web/src/components/settings/ProviderInstanceCard.tsx:498`（object-key）；`apps/web/src/components/settings/ProviderInstanceCard.tsx:554`（object-key）；…（共 13 处）

### `stack`（A，message，1 处）

- 显示位置（照常转换）：`apps/web/src/components/ThreadStatusIndicators.tsx:375`（A，ThreadPullRequestsMiniList）
- 同一文本作为值用途字面量出现 64 次：`apps/desktop/src/preview/PickPreload.ts:412`（object-key）；`apps/desktop/src/preview/PickPreload.ts:425`（object-key）；`apps/desktop/src/preview/PickedElementPayload.ts:46`（computed-key）；`apps/desktop/src/preview/PickedElementPayload.ts:47`（computed-key）；`apps/server/src/git/detachStackFrame.ts:9`（object-key）；`apps/server/src/mcp/toolkits/pullRequests/handlers.ts:115`（ts-type）；`apps/server/src/mcp/toolkits/pullRequests/handlers.ts:136`（object-key）；`apps/server/src/mcp/toolkits/pullRequests/tools.ts:227`（object-key）；`apps/server/src/orchestration-v2/Orchestrator.ts:536`（object-key）；`apps/server/src/orchestration-v2/Orchestrator.ts:2964`（comparison）；…（共 64 处）

### `team`（A，message，1 处）

- 显示位置（照常转换）：`apps/web/src/components/pullRequest/PullRequestReviewerPicker.tsx:125`（A，PullRequestReviewerPicker）
- 同一文本作为值用途字面量出现 6 次：`apps/server/src/orchestration-v2/Adapters/CursorAdapterV2.ts:300`（as-const）；`apps/server/src/provider/ClaudeProvider.ts:101`（switch-case）；`apps/server/src/provider/CodexProvider.ts:126`（switch-case）；`apps/server/src/pullRequest/gitHubPullRequestJson.ts:3025`（comparison）；`apps/web/src/components/pullRequest/PullRequestReviewerPicker.tsx:124`（comparison）；`packages/contracts/src/pullRequest.ts:268`（schema-literal）

### `unavailable`（A，message，1 处）

- 显示位置（照常转换）：`apps/web/src/components/device/DeviceHostAvailability.tsx:17`（A，DeviceHostAvailability）
- 同一文本作为值用途字面量出现 95 次：`apps/desktop/src/backend/DesktopServerExposure.ts:306`（object-key）；`apps/desktop/src/backend/DesktopServerExposure.ts:406`（object-key）；`apps/desktop/src/preview/BrowserImport/BrowserImport.ts:192`（object-key）；`apps/desktop/src/snapShot/DesktopSnapShot.ts:861`（comparison）；`apps/desktop/src/snapShot/DesktopSnapShot.ts:1013`（comparison）；`apps/desktop/src/snapShot/DesktopSnapShot.ts:1087`（comparison）；`apps/desktop/src/snapShot/DesktopSnapShot.ts:1098`（comparison）；`apps/desktop/src/snapShot/DesktopSnapShot.ts:1101`（comparison）；`apps/desktop/src/snapShot/DesktopSnapShot.ts:1133`（comparison）；`apps/desktop/src/snapShot/DesktopSnapShot.ts:1140`（comparison）；…（共 95 处）

### `viewed`（A，message，1 处）

- 显示位置（照常转换）：`apps/web/src/components/pullRequest/PullRequestCodeTab.tsx:1136`（A，PullRequestCodeTab）
- 同一文本作为值用途字面量出现 14 次：`apps/server/src/persistence/PullRequestFilesViewed.ts:48`（object-key）；`apps/server/src/pullRequest/GitHubPullRequestCli.ts:642`（object-key）；`apps/server/src/pullRequest/PullRequestProvider.ts:540`（object-key）；`apps/server/src/pullRequest/gitHubPullRequestJson.ts:3365`（object-key）；`apps/server/src/pullRequest/pullRequestViewedFiles.ts:273`（as-const）；`apps/server/src/pullRequest/pullRequestViewedFiles.ts:281`（as-const）；`apps/server/src/pullRequest/pullRequestViewedFiles.ts:360`（object-key）；`apps/web/src/components/pullRequest/pullRequestFilesViewed.logic.ts:22`（comparison）；`apps/web/src/components/pullRequest/pullRequestFilesViewed.logic.ts:84`（object-key）；`apps/web/src/components/pullRequest/pullRequestFilesViewed.logic.ts:88`（object-key）；…（共 14 处）
