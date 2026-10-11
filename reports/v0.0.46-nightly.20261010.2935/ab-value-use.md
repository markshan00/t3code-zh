# A/B 值用途重名 v0.0.46-nightly.20261010.2935

A（JSX 文本/子表达式）和 B 原始白名单属性的文字，即使同一文本也出现在「从不转换」的值用途位置（比较、`switch case`、`as const`、字面量类型、对象键），仍照常转换——它们只用于显示。§4 要求把这些位置列出以便人工核对：若上游将来改成拿这些字段做判断，就需要改判定。

共 216 处显示位置（116 条文字）。此清单与 suspicious、可翻译计数分开统计，不计入可翻译位置总数。

### `Off`（A，message，10 处）

- 显示位置（照常转换）：`apps/web/src/components/chat/TraitsPicker.tsx:474`（A，TraitsMenuContent）；`apps/web/src/components/clerk/MobileClientsUserProfilePage.tsx:31`（A，MobileClientStatusBadge）；`apps/web/src/components/settings/ConnectionsSettings.tsx:3451`（A，renderWslRow）；`apps/web/src/components/settings/GitHubRoutingSettings.tsx:72`（B，GitHubRoutingSettings）；`apps/web/src/components/settings/LoadBalancingSettings.tsx:77`（B，LoadBalancingSettings）；`apps/web/src/components/settings/SnapShotSettings.tsx:500`（A，SnapShotSettings）；`apps/web/src/components/settings/SnapShotSettings.tsx:517`（A，SnapShotSettings）；`apps/web/src/components/settings/StorageSettings.tsx:155`（A，RetentionControl）；`apps/web/src/components/settings/StorageSettings.tsx:500`（A，StorageSettingsPanel）；`apps/web/src/components/settings/StorageSettings.tsx:506`（A，StorageSettingsPanel）
- 同一文本作为值用途字面量出现 2 次：`packages/shared/src/otelEnvironment.ts:32`（object-key）；`packages/shared/src/otelEnvironment.ts:392`（object-key）

### `Close`（B，message，7 处）

- 显示位置（照常转换）：`apps/web/src/components/files/AttachmentFilePreview.tsx:348`（B，AttachmentFilePreview）；`apps/web/src/components/onboarding/WelcomeWizard.tsx:1162`（A，AgentInstallTerminal）；`apps/web/src/components/settings/BrowserImportWizard.tsx:601`（A，BlockedStep）；`apps/web/src/components/settings/ProjectFaviconPickerDialog.tsx:80`（B，ProjectFaviconPickerDialog）；`apps/web/src/components/settings/SnapShotSetupDialog.tsx:392`（A，SnapShotSetupDialog）；`apps/web/src/components/ui/dialog.tsx:96`（B，DialogPopup）；`apps/web/src/components/ui/sheet.tsx:112`（B，SheetPopup）
- 同一文本作为值用途字面量出现 2 次：`apps/desktop/src/backend/DesktopBackendPool.ts:210`（ts-type）；`apps/desktop/src/backend/DesktopBackendPool.ts:396`（as-const）

### `Default`（A，message，6 处）

- 显示位置（照常转换）：`apps/web/src/components/chat/TraitsPicker.tsx:98`（A，DefaultBadge）；`apps/web/src/components/settings/ConnectionsSettings.tsx:1358`（A，AdvertisedEndpointListRow）；`apps/web/src/components/settings/CustomModelEditor.tsx:181`（A，renderChoice）；`apps/web/src/components/settings/DeviceHostEditor.tsx:131`（B，DeviceHostEditor）；`apps/web/src/components/settings/IntegrationsSettings.tsx:1340`（A，BrowserProfilesSetting）；`apps/web/src/components/settings/StorageSettings.tsx:88`（B，WorktreesDirectoryRow）
- 同一文本作为值用途字面量出现 4 次：`apps/web/src/components/device/DeviceControlsRail.tsx:167`（as-const）；`apps/web/src/components/settings/KeybindingsSettings.logic.ts:48`（ts-type）；`apps/web/src/components/settings/KeybindingsSettings.tsx:902`（comparison）；`apps/web/src/components/settings/KeybindingsSettings.tsx:937`（comparison）

### `Mixed`（B，message，6 处）

- 显示位置（照常转换）：`apps/web/src/components/settings/BranchNamingSettings.tsx:105`（B，BranchNamingSettings）；`apps/web/src/components/settings/ProjectDefaultsSettings.tsx:311`（A，ProjectDefaultsSettings）；`apps/web/src/components/settings/SettingsPanels.tsx:3101`（B，GeneralSettingsPanel）；`apps/web/src/components/settings/StorageSettings.tsx:88`（B，WorktreesDirectoryRow）；`apps/web/src/components/settings/StorageSettings.tsx:496`（A，StorageSettingsPanel）；`apps/web/src/components/settings/StorageSettings.tsx:597`（A，StorageSettingsPanel）
- 同一文本作为值用途字面量出现 1 次：`apps/web/src/components/usage/UsagePriceOverrides.tsx:212`（comparison）

### `None`（A，message，5 处）

- 显示位置（照常转换）：`apps/web/src/components/device/DeviceToolVersions.tsx:69`（A，DeviceToolVersions）；`apps/web/src/components/pullRequest/PullRequestGhosts.tsx:344`（A，PullRequestDetailGhost）；`apps/web/src/components/pullRequest/PullRequestSummaryTab.tsx:666`（A，PullRequestSummaryTab）；`apps/web/src/components/pullRequest/PullRequestSummaryTab.tsx:751`（A，PullRequestSummaryTab）；`apps/web/src/components/settings/ScheduledTasksSettings.tsx:1233`（B，ScheduledTaskEditorDialog）
- 同一文本作为值用途字面量出现 19 次：`apps/server/src/device/LocalDeviceHost.ts:317`（comparison）；`apps/server/src/process/agentScope.ts:123`（comparison）；`apps/server/src/process/agentScope.ts:123`（comparison）；`apps/server/src/process/agentScope.ts:157`（comparison）；`apps/server/src/process/agentScope.ts:194`（comparison）；`apps/server/src/process/agentScope.ts:297`（comparison）；`apps/server/src/project/RepositoryIdentityResolver.ts:131`（comparison）；`apps/server/src/project/RepositoryIdentityResolver.ts:153`（comparison）；`apps/server/src/vcs/VcsStatusBroadcaster.ts:162`（comparison）；`apps/web/src/assets/assetUrls.ts:86`（comparison）；…（共 19 处）

### `Sign in`（A，message，5 处）

- 显示位置（照常转换）：`apps/web/src/components/cloud/ConnectCliAuthSurface.tsx:107`（A，ConnectCliAuthorizeSurface）；`apps/web/src/components/onboarding/WelcomeWizard.tsx:498`（A，ConnectAccountOption）；`apps/web/src/components/onboarding/WelcomeWizard.tsx:1009`（A，AgentCard）；`apps/web/src/components/settings/ProviderAuthenticationSection.tsx:298`（A，ProviderAuthenticationSection）；`apps/web/src/components/settings/ProviderWizardAuthenticationStep.tsx:71`（A，ProviderWizardAuthenticationStep）
- 同一文本作为值用途字面量出现 1 次：`apps/web/src/components/settings/AddProviderInstanceDialog.logic.ts:9`（as-const）

### `Unavailable`（A，message，5 处）

- 显示位置（照常转换）：`apps/web/src/components/chat/ModelListRow.tsx:81`（A，ModelListRow）；`apps/web/src/components/chat/ProviderModelPicker.tsx:279`（A，ProviderModelPicker）；`apps/web/src/components/cloud/CloudEnvironmentConnectList.tsx:424`（A，CloudEnvironmentConnectRows）；`apps/web/src/components/settings/CodexSetupSection.tsx:1057`（B，CodexManagedRuntimeFields）；`apps/web/src/components/settings/CodexSetupSection.tsx:1076`（B，CodexManagedRuntimeFields）
- 同一文本作为值用途字面量出现 2 次：`apps/web/src/components/settings/ResourceTelemetryDiagnostics.tsx:1206`（never-attribute）；`apps/web/src/components/usage/UsagePriceOverrides.tsx:213`（comparison）

### `Actions`（A，message，4 处）

- 显示位置（照常转换）：`apps/web/src/components/ProjectScriptsControl.tsx:392`（A，ProjectScriptsControl）；`apps/web/src/components/ProjectScriptsControl.tsx:433`（A，ProjectScriptsControl）；`apps/web/src/components/settings/ProjectActionsSettings.tsx:137`（B，ProjectActionsSettings）；`apps/web/src/components/settings/ProjectActionsSettings.tsx:142`（B，ProjectActionsSettings）
- 同一文本作为值用途字面量出现 1 次：`apps/web/src/components/chat/ComposerBanner.tsx:359`（object-key）

### `Codex`（B，message，4 处）

- 显示位置（照常转换）：`apps/web/src/components/onboarding/WelcomeWizard.tsx:1773`（B，ImportRowMeta）；`apps/web/src/components/settings/CodexSetupSection.tsx:70`（B，CodexSetupSection）；`apps/web/src/components/settings/CodexSetupSection.tsx:130`（B，CodexSetupSection）；`apps/web/src/components/settings/CodexSetupSection.tsx:772`（B，ManagedCodexSetup）
- 同一文本作为值用途字面量出现 1 次：`apps/server/src/provider/CodexProvider.ts:71`（as-const）

### `Command`（A，message，4 处）

- 显示位置（照常转换）：`apps/web/src/components/projectScriptEditor.tsx:413`（A，ProjectScriptEditorDialog）；`apps/web/src/components/settings/DiagnosticsSettings.tsx:370`（A，ProcessDiagnosticsTable）；`apps/web/src/components/settings/DiagnosticsSettings.tsx:599`（A，ProcessResourceHistoryTable）；`apps/web/src/components/settings/KeybindingsSettings.tsx:1116`（B，NewKeybindingCommandSelect）
- 同一文本作为值用途字面量出现 2 次：`apps/web/src/lib/embeddedScripts.ts:244`（switch-case）；`apps/web/src/shortcutModifierState.ts:82`（switch-case）

### `Enter`（A，message，4 处）

- 显示位置（照常转换）：`apps/web/src/components/CommandPalette.tsx:3378`（A，OpenCommandPaletteDialog）；`apps/web/src/components/CommandPalette.tsx:3405`（A，OpenCommandPaletteDialog）；`apps/web/src/components/CommandPalette.tsx:3446`（A，OpenCommandPaletteDialog）；`apps/web/src/components/CommandPaletteContent.tsx:80`（A，CommandPaletteContent）
- 同一文本作为值用途字面量出现 59 次：`apps/desktop/src/preview/AnnotationKeyboard.ts:15`（comparison）；`apps/desktop/src/preview/RecordingInput.ts:29`（object-key）；`apps/web/src/browser/ServerBrowserSurface.tsx:700`（comparison）；`apps/web/src/components/BranchPicker.tsx:183`（comparison）；`apps/web/src/components/ChatMarkdown.tsx:1341`（comparison）；`apps/web/src/components/CommandPalette.tsx:3140`（comparison）；`apps/web/src/components/CommandPalette.tsx:3150`（comparison）；`apps/web/src/components/CommandPalette.tsx:3163`（comparison）；`apps/web/src/components/CommandPalette.tsx:3205`（comparison）；`apps/web/src/components/ComposerPromptEditorTiptap.tsx:1262`（comparison）；…（共 59 处）

### `Loading`（A，message，4 处）

- 显示位置（照常转换）：`apps/web/src/components/settings/AcpSessionManagementSection.tsx:362`（A，AcpSessionManagementSection）；`apps/web/src/components/settings/AcpSessionManagementSection.tsx:435`（A，AcpSessionManagementSection）；`apps/web/src/components/settings/AcpSessionManagementSection.tsx:458`（A，AcpSessionManagementSection）；`apps/web/src/components/ui/spinner.tsx:31`（B，Spinner）
- 同一文本作为值用途字面量出现 10 次：`apps/desktop/src/preview/Manager.ts:89`（ts-type）；`apps/desktop/src/preview/Manager.ts:1904`（comparison）；`apps/desktop/src/preview/Manager.ts:1957`（comparison）；`apps/server/src/preview/ServerBrowser.ts:908`（comparison）；`apps/web/src/components/preview/PreviewView.tsx:232`（comparison）；`apps/web/src/components/preview/usePreviewBridge.ts:111`（comparison）；`apps/web/src/components/preview/usePreviewBridge.ts:111`（comparison）；`apps/web/src/components/preview/usePreviewBridge.ts:122`（comparison）；`packages/client-runtime/src/state/assets.ts:71`（ts-type）；`packages/contracts/src/ipc.ts:596`（ts-type）

### `Ready`（A，message，4 处）

- 显示位置（照常转换）：`apps/web/src/components/device/DeviceSetup.tsx:313`（A，PlatformStatus）；`apps/web/src/components/onboarding/WelcomeWizard.tsx:993`（A，AgentCard）；`apps/web/src/components/settings/CodexSetupSection.tsx:100`（A，CodexSetupSection）；`apps/web/src/components/settings/CodexSetupSection.tsx:814`（A，ManagedCodexSetup）
- 同一文本作为值用途字面量出现 5 次：`apps/desktop/src/backend/DesktopBackendConfiguration.ts:292`（ts-type）；`apps/desktop/src/backend/DesktopBackendConfiguration.ts:448`（as-const）；`apps/desktop/src/backend/DesktopBackendConfiguration.ts:499`（as-const）；`apps/desktop/src/backend/DesktopBackendConfiguration.ts:723`（comparison）；`apps/desktop/src/backend/DesktopBackendConfiguration.ts:765`（comparison）

### `Android`（A，message，3 处）

- 显示位置（照常转换）：`apps/web/src/components/NightlyMobileBeta.tsx:131`（A，NightlyMobileBetaRow）；`apps/web/src/components/RightPanelTabs.tsx:1519`（A，DeviceTabTooltip）；`apps/web/src/components/device/DeviceHostAvailability.tsx:16`（A，DeviceHostAvailability）
- 同一文本作为值用途字面量出现 2 次：`apps/server/src/ws.ts:669`（comparison）；`packages/contracts/src/baseSchemas.ts:353`（schema-literal）

### `Branch`（A，message，3 处）

- 显示位置（照常转换）：`apps/web/src/components/DiffPanel.tsx:858`（A，DiffPanel）；`apps/web/src/components/GitActionsControl.tsx:2014`（A，GitActionsControl）；`apps/web/src/components/chat/WorktreeSetupCard.tsx:262`（A，SetupDetails）
- 同一文本作为值用途字面量出现 1 次：`apps/web/src/components/chat/SubagentTooltipContent.tsx:174`（comparison）

### `Delete`（A，message，3 处）

- 显示位置（照常转换）：`apps/web/src/components/projectScriptEditor.tsx:484`（A，ProjectScriptEditorDialog）；`apps/web/src/components/settings/AcpSessionManagementSection.tsx:417`（A，AcpSessionManagementSection）；`apps/web/src/components/settings/ScheduledTasksSettings.tsx:509`（A，ScheduledTaskRow）
- 同一文本作为值用途字面量出现 9 次：`apps/desktop/src/preview/RecordingInput.ts:32`（object-key）；`apps/web/src/browser/ServerBrowserSurface.tsx:65`（as-const）；`apps/web/src/browser/ServerBrowserSurface.tsx:65`（as-const）；`apps/web/src/browser/ServerBrowserSurface.tsx:716`（comparison）；`apps/web/src/components/projectScriptEditor.tsx:233`（comparison）；`apps/web/src/composer-rich-text-doc.ts:240`（object-key）；`apps/web/src/terminal/ghostty/keyCodes.ts:73`（as-const）；`packages/client-runtime/src/device/stream.ts:305`（object-key）；`packages/client-runtime/src/device/stream.ts:335`（object-key）

### `Dismiss`（A，message，3 处）

- 显示位置（照常转换）：`apps/web/src/browser/ServerBrowserSurface.tsx:868`（A，ServerBrowserSurface）；`apps/web/src/components/ChatView.tsx:7681`（B，threadStatusLine）；`apps/web/src/components/desktop/SshPasswordPromptDialog.tsx:212`（A，ActiveSshPasswordPrompt）
- 同一文本作为值用途字面量出现 1 次：`apps/web/src/components/chat/ComposerBanner.tsx:366`（object-key）

### `Host`（B，message，3 处）

- 显示位置（照常转换）：`apps/web/src/components/pullRequest/PullRequestListFilters.tsx:567`（B，PullRequestFiltersMenu）；`apps/web/src/components/settings/ConnectionsSettings.tsx:2927`（A，renderRemoteFields）；`apps/web/src/components/settings/GitHubTokenSettings.tsx:90`（A，GitHubTokenSettings）
- 同一文本作为值用途字面量出现 1 次：`apps/web/src/components/chat/ComposerSurface.tsx:101`（object-key）

### `Nightly`（A，message，3 处）

- 显示位置（照常转换）：`apps/web/src/components/settings/SettingsPanels.tsx:470`（A，AboutVersionSection）；`apps/web/src/components/settings/SettingsPanels.tsx:478`（A，AboutVersionSection）；`apps/web/src/components/settings/SettingsPanels.tsx:506`（A，AboutVersionSection）
- 同一文本作为值用途字面量出现 3 次：`apps/web/src/components/SidebarStageBackdrop.tsx:9`（ts-type）；`packages/contracts/src/ipc.ts:84`（ts-type）；`packages/contracts/src/ipc.ts:99`（schema-literal）

### `Process`（A，message，3 处）

- 显示位置（照常转换）：`apps/web/src/components/settings/DiagnosticsSettings.tsx:593`（A，ProcessResourceHistoryTable）；`apps/web/src/components/settings/ResourceTelemetryDiagnostics.tsx:588`（A，ProcessTable）；`apps/web/src/components/settings/ResourceTelemetryDiagnostics.tsx:692`（A，HistoryProcessTable）
- 同一文本作为值用途字面量出现 3 次：`apps/desktop/src/preview/RecordingInput.ts:21`（membership）；`apps/web/src/browser/ServerBrowserSurface.tsx:678`（comparison）；`apps/web/src/terminal/ghostty/surface.ts:421`（comparison）

### `Project`（B，message，3 处）

- 显示位置（照常转换）：`apps/web/src/components/pullRequest/PullRequestListFilters.tsx:589`（B，PullRequestFiltersMenu）；`apps/web/src/components/settings/ProjectSettingsPanel.tsx:457`（B，ProjectDetail）；`apps/web/src/components/settings/ScheduledTasksSettings.tsx:1037`（B，ScheduledTaskEditorDialog）
- 同一文本作为值用途字面量出现 1 次：`apps/web/src/components/settings/KeybindingsSettings.logic.ts:48`（ts-type）

### `Settled`（B，message，3 处）

- 显示位置（照常转换）：`apps/web/src/components/ChatView.tsx:7671`（B，threadStatusLine）；`apps/web/src/components/Sidebar.tsx:5498`（B，Sidebar）；`apps/web/src/components/Sidebar.tsx:5515`（B，Sidebar）
- 同一文本作为值用途字面量出现 1 次：`apps/web/src/hooks/showThreadUndoNotice.ts:12`（ts-type）

### `Active`（B，message，2 处）

- 显示位置（照常转换）：`apps/web/src/components/Sidebar.tsx:5428`（B，Sidebar）；`apps/web/src/components/Sidebar.tsx:5439`（B，Sidebar）
- 同一文本作为值用途字面量出现 5 次：`apps/desktop/src/backend/DesktopBackendPool.ts:188`（ts-type）；`apps/desktop/src/backend/DesktopBackendPool.ts:330`（comparison）；`apps/desktop/src/backend/DesktopBackendPool.ts:431`（comparison）；`apps/desktop/src/backend/DesktopBackendPool.ts:437`（comparison）；`apps/web/src/components/settings/ResourceTelemetryDiagnostics.tsx:1134`（never-attribute）

### `Backspace`（A，message，2 处）

- 显示位置（照常转换）：`apps/web/src/components/CommandPaletteContent.tsx:86`（A，CommandPaletteContent）；`apps/web/src/components/projectScriptEditor.tsx:408`（A，ProjectScriptEditorDialog）
- 同一文本作为值用途字面量出现 12 次：`apps/desktop/src/preview/RecordingInput.ts:31`（object-key）；`apps/web/src/browser/ServerBrowserSurface.tsx:64`（as-const）；`apps/web/src/browser/ServerBrowserSurface.tsx:64`（as-const）；`apps/web/src/browser/ServerBrowserSurface.tsx:716`（comparison）；`apps/web/src/components/CommandPalette.tsx:3176`（comparison）；`apps/web/src/components/chat/ComposerStashMenu.tsx:104`（comparison）；`apps/web/src/components/projectScriptEditor.tsx:233`（comparison）；`apps/web/src/composer-rich-text-doc.ts:158`（object-key）；`apps/web/src/composer-rich-text-doc.ts:239`（object-key）；`apps/web/src/terminal/ghostty/keyCodes.ts:58`（as-const）；…（共 12 处）

### `Browser`（B，message，2 处）

- 显示位置（照常转换）：`apps/web/src/components/settings/IntegrationsSettings.tsx:1540`（B，IntegrationsSettingsPanel）；`apps/web/src/components/settings/ProjectDefaultsSettings.tsx:264`（B，ProjectDefaultsSettings）
- 同一文本作为值用途字面量出现 6 次：`apps/server/src/provider/CodexToolPresentation.ts:190`（comparison）；`apps/server/src/resourceTelemetry/Model.ts:104`（switch-case）；`apps/web/src/components/RightPanelTabs.tsx:535`（comparison）；`apps/web/src/components/RightPanelTabs.tsx:547`（comparison）；`apps/web/src/components/RightPanelTabs.tsx:1356`（comparison）；`packages/contracts/src/resourceTelemetry.ts:232`（schema-literal）

### `Connect`（A，message，2 处）

- 显示位置（照常转换）：`apps/web/src/components/settings/CodexSetupSection.tsx:695`（A，ManagedCodexSetup）；`apps/web/src/components/settings/ProviderAuthenticationSection.tsx:422`（A，ProviderAuthenticationSection）
- 同一文本作为值用途字面量出现 1 次：`apps/web/src/components/onboarding/WelcomeWizard.tsx:115`（as-const）

### `Custom`（A，message，2 处）

- 显示位置（照常转换）：`apps/web/src/components/settings/StorageSettings.tsx:501`（A，StorageSettingsPanel）；`apps/web/src/components/settings/StorageSettings.tsx:507`（A，StorageSettingsPanel）
- 同一文本作为值用途字面量出现 2 次：`apps/web/src/components/settings/KeybindingsSettings.logic.ts:48`（ts-type）；`apps/web/src/components/settings/KeybindingsSettings.tsx:901`（comparison）

### `Devices`（B，message，2 处）

- 显示位置（照常转换）：`apps/web/src/components/settings/IntegrationsSettings.tsx:632`（B，DeviceIntegrationSettings）；`apps/web/src/components/settings/ProviderSettingsPanel.tsx:381`（B，ProviderSettingsPanelContent）
- 同一文本作为值用途字面量出现 1 次：`apps/web/src/components/device/DevicePanel.tsx:217`（never-attribute）

### `Disabled`（A，message，2 处）

- 显示位置（照常转换）：`apps/web/src/components/onboarding/WelcomeWizard.tsx:998`（A，AgentCard）；`apps/web/src/components/settings/AcpSessionManagementSection.tsx:509`（A，AcpSessionManagementSection）
- 同一文本作为值用途字面量出现 1 次：`apps/web/src/components/settings/ResourceTelemetryDiagnostics.tsx:1127`（never-attribute）

### `Files`（A，message，2 处）

- 显示位置（照常转换）：`apps/web/src/components/GitActionsControl.tsx:2036`（A，GitActionsControl）；`apps/web/src/components/diffs/DiffFileTree.tsx:173`（A，DiffFileTree）
- 同一文本作为值用途字面量出现 1 次：`apps/web/src/components/chat/workspaceFileDrop.ts:26`（membership）

### `Local ACP command`（A，message，2 处）

- 显示位置（照常转换）：`apps/web/src/components/settings/AcpRegistrySearchStep.tsx:186`（A，AcpRegistrySearchStep）；`apps/web/src/components/settings/AddProviderInstanceDialog.tsx:477`（A，AddProviderInstanceDialog）
- 同一文本作为值用途字面量出现 1 次：`apps/web/src/components/settings/AddProviderInstanceDialog.tsx:190`（as-const）

### `New thread`（A，message，2 处）

- 显示位置（照常转换）：`apps/web/src/components/LegacySidebar.tsx:2553`（A，SidebarProjectItem）；`apps/web/src/components/sidebar/SidebarThreadHeader.tsx:136`（B，SidebarThreadHeader）
- 同一文本作为值用途字面量出现 1 次：`apps/server/src/orchestration-v2/ThreadTitleRegenerationService.ts:118`（comparison）

### `Provider`（A，message，2 处）

- 显示位置（照常转换）：`apps/web/src/components/GitActionsControl.tsx:753`（A，PublishRepositoryDialog）；`apps/web/src/components/settings/AddProviderInstanceDialog.tsx:418`（A，AddProviderInstanceDialog）
- 同一文本作为值用途字面量出现 4 次：`apps/web/src/components/GitActionsControl.tsx:642`（as-const）；`apps/web/src/components/settings/AddProviderInstanceDialog.logic.ts:8`（as-const）；`apps/web/src/components/settings/AddProviderInstanceDialog.logic.ts:9`（as-const）；`apps/web/src/components/settings/AddProviderInstanceDialog.logic.ts:10`（as-const）

### `Read`（B，message，2 处）

- 显示位置（照常转换）：`apps/web/src/components/settings/ResourceTelemetryDiagnostics.tsx:286`（B，AggregateCard）；`apps/web/src/components/settings/ResourceTelemetryDiagnostics.tsx:697`（A，HistoryProcessTable）
- 同一文本作为值用途字面量出现 1 次：`apps/server/src/orchestration-v2/Adapters/ClaudeAdapterV2.ts:296`（as-const）

### `Repository`（A，message，2 处）

- 显示位置（照常转换）：`apps/web/src/components/CommandPalette.tsx:3558`（A，OpenCommandPaletteDialog）；`apps/web/src/components/GitActionsControl.tsx:830`（A，PublishRepositoryDialog）
- 同一文本作为值用途字面量出现 4 次：`apps/server/src/project/AgentSessionScanner.ts:700`（ts-type）；`apps/server/src/project/AgentSessionScanner.ts:722`（as-const）；`apps/server/src/project/AgentSessionScanner.ts:1245`（comparison）；`apps/web/src/components/GitActionsControl.tsx:642`（as-const）

### `Skill`（A，message，2 处）

- 显示位置（照常转换）：`apps/web/src/components/chat/ComposerCommandMenu.tsx:271`（A，SkillSourceBadge）；`apps/web/src/components/chat/MessagesTimeline.tsx:4499`（B，userMessageContextPresentationRegistry）
- 同一文本作为值用途字面量出现 1 次：`packages/shared/src/toolActivity.ts:22`（comparison）

### `Snoozed`（B，message，2 处）

- 显示位置（照常转换）：`apps/web/src/components/ChatView.tsx:7659`（B，threadStatusLine）；`apps/web/src/components/Sidebar.tsx:5478`（B，Sidebar）
- 同一文本作为值用途字面量出现 1 次：`apps/web/src/hooks/showThreadUndoNotice.ts:12`（ts-type）

### `Stop`（A，message，2 处）

- 显示位置（照常转换）：`apps/web/src/components/ChatView.tsx:7632`（A，backgroundWorkBannerItem）；`apps/web/src/components/preview/PreviewChromeRow.tsx:164`（B，PreviewChromeRow）
- 同一文本作为值用途字面量出现 2 次：`packages/effect-codex-app-server/src/_generated/schema.gen.ts:52065`（object-key）；`packages/effect-codex-app-server/src/_generated/schema.gen.ts:52089`（object-key）

### `T3 Code`（A，message，2 处）

- 显示位置（照常转换）：`apps/web/src/components/chat/MessagesTimeline.tsx:2759`（A，AssistantTimelineRow）；`apps/web/src/components/onboarding/WelcomeWizard.tsx:237`（B，WelcomeWizard）
- 同一文本作为值用途字面量出现 1 次：`apps/server/src/cloud/cliAuthHtml.ts:12`（as-const）

### `Version`（B，message，2 处）

- 显示位置（照常转换）：`apps/web/src/components/settings/ConnectionsSettings.tsx:3657`（B，ConnectionsSettings）；`apps/web/src/components/settings/SettingsPanels.tsx:275`（A，AboutVersionTitle）
- 同一文本作为值用途字面量出现 3 次：`apps/desktop/src/snapShot/LinuxSnapShot.ts:55`（object-key）；`apps/desktop/src/snapShot/LinuxSnapShot.ts:56`（object-key）；`apps/desktop/src/snapShot/NiriSnapShot.ts:45`（object-key）

### `Working`（A，message，2 处）

- 显示位置（照常转换）：`apps/web/src/components/CommandPalette.tsx:3403`（A，OpenCommandPaletteDialog）；`apps/web/src/components/Sidebar.tsx:5460`（B，Sidebar）
- 同一文本作为值用途字面量出现 2 次：`apps/web/src/components/Sidebar.logic.ts:628`（ts-type）；`apps/web/src/components/Sidebar.logic.ts:643`（object-key）

### `comment`（A，message，2 处）

- 显示位置（照常转换）：`apps/web/src/components/pullRequest/PullRequestReviewAnnotation.tsx:229`（A，ReviewThreadCard）；`apps/web/src/components/pullRequest/PullRequestTimelineTab.tsx:329`（A，ConversationGroup）
- 同一文本作为值用途字面量出现 108 次：`apps/desktop/src/preview/PickPreload.ts:1431`（object-key）；`apps/desktop/src/preview/PickedElementPayload.ts:76`（computed-key）；`apps/server/src/pullRequest/PullRequestService.ts:293`（object-key）；`apps/server/src/pullRequest/PullRequestService.ts:330`（object-key）；`apps/server/src/pullRequest/PullRequestService.ts:680`（object-key）；`apps/server/src/pullRequest/PullRequestService.ts:2123`（ts-type）；`apps/server/src/pullRequest/PullRequestService.ts:2129`（error-constructor）；`apps/server/src/pullRequest/PullRequestService.ts:2139`（error-constructor）；`apps/server/src/pullRequest/PullRequestService.ts:2149`（error-constructor）；`apps/server/src/pullRequest/PullRequestService.ts:3494`（object-key）；…（共 108 处）

### `comments`（A，message，2 处）

- 显示位置（照常转换）：`apps/web/src/components/pullRequest/PullRequestReviewAnnotation.tsx:229`（A，ReviewThreadCard）；`apps/web/src/components/pullRequest/PullRequestTimelineTab.tsx:329`（A，ConversationGroup）
- 同一文本作为值用途字面量出现 84 次：`apps/server/src/orchestration-v2/PullRequestWatchReactor.ts:292`（object-key）；`apps/server/src/orchestration-v2/PullRequestWatchReactor.ts:381`（object-key）；`apps/server/src/pullRequest/PullRequestService.ts:1855`（object-key）；`apps/server/src/pullRequest/PullRequestService.ts:2284`（object-key）；`apps/web/src/components/chat/ThreadDetailsPrRow.tsx:207`（object-key）；`apps/web/src/components/pullRequest/PullRequestDetailPanel.tsx:695`（object-key）；`apps/web/src/components/pullRequest/PullRequestDetailPanel.tsx:1377`（object-key）；`apps/web/src/components/pullRequest/PullRequestReviewAnnotation.tsx:159`（object-key）；`apps/web/src/components/pullRequest/PullRequestReviewAnnotation.tsx:200`（object-key）；`apps/web/src/components/pullRequest/PullRequestReviewForm.tsx:98`（object-key）；…（共 84 处）

### `default`（A，message，2 处）

- 显示位置（照常转换）：`apps/web/src/components/settings/EnvironmentIconPicker.tsx:98`（A，EnvironmentIconMenu）；`apps/web/src/components/settings/FontFamilyPicker.tsx:187`（A，renderItem）
- 同一文本作为值用途字面量出现 516 次：`apps/desktop/src/ipc/methods/window.ts:171`（comparison）；`apps/desktop/src/snapShot/RegionSnapShotWorker.ts:9`（object-key）；`apps/server/src/device/DeviceActions.ts:103`（object-key）；`apps/server/src/device/DeviceActions.ts:109`（object-key）；`apps/server/src/mcp/OrchestratorMcpService.ts:974`（as-const）；`apps/server/src/mcp/threadAccess.ts:141`（comparison）；`apps/server/src/orchestration-v2/DispatchModeLimit.ts:41`（object-key）；`apps/server/src/provider/CodexMcpElicitation.ts:37`（object-key）；`apps/web/src/components/ChatView.tsx:702`（object-key）；`apps/web/src/components/ChatView.tsx:708`（object-key）；…（共 516 处）

### `file`（A，message，2 处）

- 显示位置（照常转换）：`apps/web/src/components/chat/ThreadDetailsPrRow.tsx:297`（A，ThreadDetailsPrRow）；`apps/web/src/components/pullRequest/PullRequestCodeTab.tsx:1150`（A，PullRequestCodeTab）
- 同一文本作为值用途字面量出现 195 次：`apps/desktop/src/permissions/MacPermissionHelper.ts:143`（object-key）；`apps/server/src/assets/AssetAccess.ts:177`（ts-type）；`apps/server/src/assets/AssetAccess.ts:182`（object-key）；`apps/server/src/assets/AssetAccess.ts:935`（object-key）；`apps/server/src/assets/AttachmentUpload.ts:45`（schema-literal）；`apps/server/src/assets/AttachmentUpload.ts:98`（comparison）；`apps/server/src/assets/AttachmentUpload.ts:164`（comparison）；`apps/server/src/attachmentStore.ts:149`（switch-case）；`apps/server/src/http.ts:169`（object-key）；`apps/server/src/http.ts:493`（object-key）；…（共 195 处）

### `files`（A，message，2 处）

- 显示位置（照常转换）：`apps/web/src/components/chat/ThreadDetailsPrRow.tsx:297`（A，ThreadDetailsPrRow）；`apps/web/src/components/pullRequest/PullRequestCodeTab.tsx:1150`（A，PullRequestCodeTab）
- 同一文本作为值用途字面量出现 199 次：`apps/desktop/src/snapShot/CaptureShortcutConfig.ts:98`（object-key）；`apps/desktop/src/snapShot/CaptureShortcutConfig.ts:210`（object-key）；`apps/desktop/src/snapShot/CaptureShortcutConfig.ts:225`（object-key）；`apps/server/src/git/GitManager.ts:1078`（object-key）；`apps/server/src/git/GitWorkflowService.ts:138`（object-key）；`apps/server/src/orchestration-v2/CheckpointCaptureService.ts:283`（object-key）；`apps/server/src/orchestration-v2/CheckpointService.ts:227`（object-key）；`apps/server/src/orchestration-v2/CheckpointService.ts:227`（ts-type）；`apps/server/src/orchestration-v2/CheckpointService.ts:241`（object-key）；`apps/server/src/orchestration-v2/CheckpointService.ts:343`（object-key）；…（共 199 处）

### `iOS`（A，message，2 处）

- 显示位置（照常转换）：`apps/web/src/components/RightPanelTabs.tsx:1519`（A，DeviceTabTooltip）；`apps/web/src/components/device/DeviceHostAvailability.tsx:16`（A，DeviceHostAvailability）
- 同一文本作为值用途字面量出现 2 次：`apps/server/src/ws.ts:669`（comparison）；`packages/contracts/src/baseSchemas.ts:352`（schema-literal）

### `on`（A，message，2 处）

- 显示位置（照常转换）：`apps/web/src/components/settings/ScheduledTasksSettings.tsx:1297`（A，ScheduledTaskEditorDialog）；`apps/web/src/components/settings/SettingsScopeSentence.tsx:75`（A，SettingsScopeSentence）
- 同一文本作为值用途字面量出现 25 次：`apps/desktop/src/app/DesktopLifecycle.ts:69`（object-key）；`apps/desktop/src/electron/ElectronApp.ts:79`（object-key）；`apps/desktop/src/electron/ElectronApp.ts:208`（object-key）；`apps/desktop/src/electron/ElectronUpdater.ts:76`（object-key）；`apps/desktop/src/electron/ElectronUpdater.ts:154`（object-key）；`apps/desktop/src/electron/ElectronUpdater.ts:156`（object-key）；`apps/desktop/src/ipc/DesktopIpc.ts:26`（object-key）；`apps/desktop/src/snapShot/snapShot.ts:134`（ts-type）；`apps/desktop/src/snapShot/snapShot.ts:234`（comparison）；`apps/desktop/src/updates/updatesTestHarness.ts:100`（object-key）；…（共 25 处）

### `value`（B，message，2 处）

- 显示位置（照常转换）：`apps/web/src/components/settings/CustomModelEditor.tsx:156`（B，renderChoice）；`apps/web/src/components/settings/ProviderInstanceCard.tsx:420`（B，ProviderEnvironmentSection）
- 同一文本作为值用途字面量出现 831 次：`apps/desktop/src/app/DesktopObservability.ts:113`（object-key）；`apps/desktop/src/app/DesktopObservability.ts:249`（object-key）；`apps/desktop/src/app/DesktopObservability.ts:255`（object-key）；`apps/desktop/src/app/chromiumLocalStorage.ts:269`（object-key）；`apps/desktop/src/app/chromiumLocalStorage.ts:293`（object-key）；`apps/desktop/src/app/chromiumLocalStorage.ts:295`（object-key）；`apps/desktop/src/app/chromiumLocalStorage.ts:353`（object-key）；`apps/desktop/src/preview/BrowserImport/BrowserImport.ts:130`（object-key）；`apps/desktop/src/preview/BrowserImport/ChromiumCookies.ts:82`（object-key）；`apps/desktop/src/preview/BrowserImport/ChromiumCookies.ts:98`（object-key）；…（共 831 处）

### `Add ChatGPT account`（B，message，1 处）

- 显示位置（照常转换）：`apps/web/src/components/settings/AddCodexAccountDialog.tsx:94`（B，AddCodexAccountDialog）
- 同一文本作为值用途字面量出现 1 次：`apps/web/src/components/settings/AddCodexAccountDialog.tsx:39`（non-display-call）

### `Alt`（A，message，1 处）

- 显示位置（照常转换）：`apps/web/src/components/settings/KeybindingsSettings.tsx:102`（A，KeybindingPill）
- 同一文本作为值用途字面量出现 6 次：`apps/desktop/src/preview/RecordingInput.ts:24`（comparison）；`apps/desktop/src/preview/RecordingInput.ts:41`（membership）；`apps/web/src/components/ComposerPromptEditorTiptap.tsx:1767`（comparison）；`apps/web/src/components/settings/useSnapShotShortcutRecorder.tsx:23`（object-key）；`apps/web/src/shortcutModifierState.ts:86`（switch-case）；`packages/contracts/src/previewAutomation.ts:572`（schema-literal）

### `Any`（A，message，1 处）

- 显示位置（照常转换）：`apps/web/src/components/pullRequest/PullRequestListFilters.tsx:351`（A，PullRequestLabelFilter）
- 同一文本作为值用途字面量出现 1 次：`apps/server/src/project/AgentSessionJson.ts:34`（switch-case）

### `App`（B，message，1 处）

- 显示位置（照常转换）：`apps/web/src/components/device/DeviceToolsPanel.tsx:134`（B，DeviceToolsPanel）
- 同一文本作为值用途字面量出现 6 次：`apps/desktop/src/electron/WindowsForegroundFocusWorker.ts:29`（ts-type）；`apps/desktop/src/electron/WindowsForegroundFocusWorker.ts:47`（ts-type）；`apps/desktop/src/electron/WindowsForegroundFocusWorker.ts:60`（ts-type）；`apps/desktop/src/electron/WindowsForegroundFocusWorker.ts:79`（object-key）；`apps/desktop/src/snapShot/SnapShotAccessibility.ts:39`（ts-type）；`apps/desktop/src/snapShot/SnapShotAccessibilityWorker.ts:9`（object-key）

### `Attachment`（A，message，1 处）

- 显示位置（照常转换）：`apps/web/src/components/files/AttachmentFilePreview.tsx:292`（A，AttachmentFilePreview）
- 同一文本作为值用途字面量出现 1 次：`apps/web/src/components/chat/ComposerBanner.tsx:351`（object-key）

### `Body`（B，message，1 处）

- 显示位置（照常转换）：`apps/web/src/components/settings/ScheduledTasksSettings.tsx:601`（B，WebhookDeliveriesDialog）
- 同一文本作为值用途字面量出现 1 次：`apps/web/src/components/chat/ComposerBanner.tsx:363`（object-key）

### `Commit`（A，message，1 处）

- 显示位置（照常转换）：`apps/web/src/components/GitActionsControl.tsx:2165`（A，GitActionsControl）
- 同一文本作为值用途字面量出现 1 次：`apps/web/src/components/GitActionsControl.tsx:397`（comparison）

### `Copy`（A，message，1 处）

- 显示位置（照常转换）：`apps/web/src/components/settings/ScheduledTasksSettings.tsx:733`（A，WebhookEndpointField）
- 同一文本作为值用途字面量出现 1 次：`apps/web/src/terminal/ghostty/keyCodes.ts:178`（as-const）

### `Count`（A，message，1 处）

- 显示位置（照常转换）：`apps/web/src/components/settings/ResourceTelemetryDiagnostics.tsx:778`（A，AttributionTable）
- 同一文本作为值用途字面量出现 1 次：`apps/web/src/components/chat/ComposerBanner.tsx:362`（object-key）

### `Cursor`（A，message，1 处）

- 显示位置（照常转换）：`apps/web/src/components/usage/UsagePage.tsx:1130`（A，CursorEnableLimits）
- 同一文本作为值用途字面量出现 2 次：`packages/provider-cursor/src/server/sdk.ts:11`（object-key）；`packages/provider-cursor/src/server/status.ts:27`（as-const）

### `Desktop`（B，message，1 处）

- 显示位置（照常转换）：`apps/web/src/components/settings/ResourceTelemetryDiagnostics.tsx:1080`（B，ResourceTelemetryDiagnostics）
- 同一文本作为值用途字面量出现 1 次：`packages/shared/src/previewViewport.ts:11`（ts-type）

### `Device hub`（B，message，1 处）

- 显示位置（照常转换）：`apps/web/src/components/settings/IntegrationsSettings.tsx:803`（B，DeviceIntegrationControls）
- 同一文本作为值用途字面量出现 2 次：`apps/web/src/components/device/DeviceToolVersions.tsx:54`（as-const）；`packages/client-runtime/src/state/device.ts:79`（as-const）

### `Enabled`（A，message，1 处）

- 显示位置（照常转换）：`apps/web/src/components/settings/ScheduledTasksSettings.tsx:1342`（A，ScheduledTaskEditorDialog）
- 同一文本作为值用途字面量出现 1 次：`apps/web/src/components/settings/ResourceTelemetryDiagnostics.tsx:1126`（never-attribute）

### `Encoding`（B，message，1 处）

- 显示位置（照常转换）：`apps/web/src/components/settings/ScheduledTasksSettings.tsx:1242`（B，ScheduledTaskEditorDialog）
- 同一文本作为值用途字面量出现 7 次：`apps/server/src/persistence/Errors.ts:8`（switch-case）；`packages/effect-acp/src/errors.ts:21`（schema-literal）；`packages/effect-acp/src/errors.ts:51`（switch-case）；`packages/effect-codex-app-server/src/errors.ts:14`（schema-literal）；`packages/effect-codex-app-server/src/errors.ts:44`（switch-case）；`packages/shared/src/schemaJson.ts:57`（switch-case）；`packages/shared/src/schemaJson.ts:78`（switch-case）

### `Environment disconnected`（B，message，1 处）

- 显示位置（照常转换）：`apps/web/src/components/settings/ScheduledTasksSettings.tsx:366`（B，ScheduledTaskEnvironmentSection）
- 同一文本作为值用途字面量出现 3 次：`apps/web/src/components/settings/DeviceHostsSettings.tsx:46`（error-constructor）；`apps/web/src/components/settings/IntegrationsSettings.tsx:691`（error-constructor）；`apps/web/src/components/settings/deviceHostConnectionChecks.ts:49`（error-constructor）

### `Failed`（A，message，1 处）

- 显示位置（照常转换）：`apps/web/src/components/settings/DeviceHostEditor.tsx:184`（A，DeviceHostEditor）
- 同一文本作为值用途字面量出现 13 次：`apps/desktop/src/backend/DesktopBackendConfiguration.ts:304`（ts-type）；`apps/desktop/src/backend/DesktopBackendConfiguration.ts:349`（as-const）；`apps/desktop/src/backend/DesktopBackendConfiguration.ts:361`（as-const）；`apps/desktop/src/backend/DesktopBackendConfiguration.ts:375`（as-const）；`apps/desktop/src/backend/DesktopBackendConfiguration.ts:391`（as-const）；`apps/desktop/src/backend/DesktopBackendConfiguration.ts:434`（as-const）；`apps/desktop/src/backend/DesktopBackendConfiguration.ts:473`（as-const）；`apps/desktop/src/backend/DesktopBackendConfiguration.ts:791`（comparison）；`packages/provider-acp/src/server/adapter.ts:1217`（ts-type）；`packages/provider-acp/src/server/adapter.ts:1753`（comparison）；…（共 13 处）

### `Filter`（A，message，1 处）

- 显示位置（照常转换）：`apps/web/src/components/pullRequest/PullRequestSummaryTab.tsx:879`（A，PullRequestSummaryTab）
- 同一文本作为值用途字面量出现 7 次：`apps/server/src/persistence/Errors.ts:7`（switch-case）；`packages/effect-acp/src/errors.ts:20`（schema-literal）；`packages/effect-acp/src/errors.ts:50`（switch-case）；`packages/effect-codex-app-server/src/errors.ts:13`（schema-literal）；`packages/effect-codex-app-server/src/errors.ts:43`（switch-case）；`packages/shared/src/schemaJson.ts:55`（switch-case）；`packages/shared/src/schemaJson.ts:80`（switch-case）

### `HEAD`（A，message，1 处）

- 显示位置（照常转换）：`apps/web/src/components/DiffPanel.tsx:818`（A，DiffPanel）
- 同一文本作为值用途字面量出现 16 次：`apps/desktop/src/electron/ElectronProtocol.ts:205`（comparison）；`apps/desktop/src/electron/ElectronProtocol.ts:210`（comparison）；`apps/desktop/src/electron/ElectronProtocol.ts:227`（comparison）；`apps/desktop/src/electron/ElectronProtocol.ts:250`（comparison）；`apps/server/src/device/DeviceHubProxy.ts:129`（comparison）；`apps/server/src/device/DeviceHubProxy.ts:164`（comparison）；`apps/server/src/http.ts:173`（ts-type）；`apps/server/src/http.ts:220`（comparison）；`apps/server/src/http.ts:442`（comparison）；`apps/server/src/orchestration-v2/ThreadLaunchService.ts:281`（condition）；…（共 16 处）

### `Home`（B，message，1 处）

- 显示位置（照常转换）：`apps/web/src/components/device/DeviceControlsRail.tsx:65`（B，DeviceControlsRail）
- 同一文本作为值用途字面量出现 15 次：`apps/web/src/components/ChatView.tsx:6616`（membership）；`apps/web/src/components/ChatView.tsx:6618`（membership）；`apps/web/src/components/ChatView.tsx:6626`（switch-case）；`apps/web/src/components/ComposerPromptEditorTiptap.tsx:1167`（comparison）；`apps/web/src/components/ComposerPromptEditorTiptap.tsx:1183`（comparison）；`apps/web/src/components/chat/MessagesTimeline.tsx:960`（membership）；`apps/web/src/components/chat/MessagesTimeline.tsx:1841`（comparison）；`apps/web/src/components/chat/composerScrollGesture.ts:16`（switch-case）；`apps/web/src/components/chat/useAssistantCitationTarget.ts:158`（membership）；`apps/web/src/components/ui/color-picker.tsx:101`（switch-case）；…（共 15 处）

### `Icon`（A，message，1 处）

- 显示位置（照常转换）：`apps/web/src/components/settings/EnvironmentIconPicker.tsx:71`（A，EnvironmentIconMenu）
- 同一文本作为值用途字面量出现 122 次：`apps/web/src/components/ChatMarkdown.tsx:408`（object-key）；`apps/web/src/components/ChatMarkdown.tsx:412`（object-key）；`apps/web/src/components/ChatMarkdown.tsx:418`（object-key）；`apps/web/src/components/ChatMarkdown.tsx:424`（object-key）；`apps/web/src/components/ChatMarkdown.tsx:430`（object-key）；`apps/web/src/components/ChatMarkdown.tsx:436`（object-key）；`apps/web/src/components/GitActionsControl.tsx:210`（object-key）；`apps/web/src/components/GitActionsControl.tsx:218`（object-key）；`apps/web/src/components/GitActionsControl.tsx:226`（object-key）；`apps/web/src/components/GitActionsControl.tsx:234`（object-key）；…（共 122 处）

### `Idle`（B，message，1 处）

- 显示位置（照常转换）：`apps/web/src/components/settings/ResourceTelemetryDiagnostics.tsx:1131`（B，ResourceTelemetryDiagnostics）
- 同一文本作为值用途字面量出现 25 次：`apps/desktop/src/preview/Manager.ts:88`（ts-type）；`apps/desktop/src/preview/Manager.ts:1300`（comparison）；`apps/desktop/src/preview/Manager.ts:2018`（comparison）；`apps/server/src/preview/Manager.ts:267`（comparison）；`apps/web/src/browser/ElectronBrowserHost.tsx:130`（comparison）；`apps/web/src/components/RightPanelTabs.tsx:625`（comparison）；`apps/web/src/components/RightPanelTabs.tsx:673`（comparison）；`apps/web/src/components/preview/PreviewView.tsx:230`（as-const）；`apps/web/src/components/preview/PreviewView.tsx:231`（comparison）；`apps/web/src/components/preview/PreviewView.tsx:235`（comparison）；…（共 25 处）

### `Interrupt`（A，message，1 处）

- 显示位置（照常转换）：`apps/web/src/components/chat/ComposerPrimaryActions.tsx:157`（A，renderStopGenerationButton）
- 同一文本作为值用途字面量出现 5 次：`packages/effect-acp/src/protocol.ts:252`（comparison）；`packages/effect-acp/src/protocol.ts:656`（switch-case）；`packages/effect-codex-app-server/src/_generated/schema.gen.ts:52057`（object-key）；`packages/effect-codex-app-server/src/_generated/schema.gen.ts:52073`（object-key）；`packages/shared/src/schemaJson.ts:139`（switch-case）

### `Mode`（A，message，1 处）

- 显示位置（照常转换）：`apps/web/src/components/chat/CompactComposerControlsMenu.tsx:64`（A，CompactComposerControlsMenu）
- 同一文本作为值用途字面量出现 1 次：`packages/shared/src/qrCode.ts:763`（object-key）

### `Path`（A，message，1 处）

- 显示位置（照常转换）：`apps/web/src/components/chat/WorktreeSetupCard.tsx:278`（A，SetupDetails）
- 同一文本作为值用途字面量出现 3 次：`apps/server/src/cli/update.ts:197`（computed-key）；`apps/server/src/process/externalLauncher.ts:127`（object-key）；`packages/provider-core/src/server/maintenanceResolver.ts:61`（object-key）

### `Projects`（A，message，1 处）

- 显示位置（照常转换）：`apps/web/src/components/LegacySidebar.tsx:3115`（A，SidebarProjectsContent）
- 同一文本作为值用途字面量出现 1 次：`apps/web/src/components/onboarding/WelcomeWizard.tsx:115`（as-const）

### `Remove route`（A，message，1 处）

- 显示位置（照常转换）：`apps/web/src/components/settings/EnvironmentRoutesList.tsx:217`（A，SortableRouteRow）
- 同一文本作为值用途字面量出现 1 次：`apps/web/src/components/settings/EnvironmentRoutesList.tsx:71`（non-display-call）

### `Skipped`（A，message，1 处）

- 显示位置（照常转换）：`apps/web/src/components/settings/BrowserImportWizard.tsx:568`（A，DoneStep）
- 同一文本作为值用途字面量出现 2 次：`apps/server/src/project/AgentSessionImporter.ts:221`（comparison）；`apps/server/src/project/AgentSessionScanner.ts:179`（ts-type）

### `This connection cannot read host files.`（A，message，1 处）

- 显示位置（照常转换）：`apps/web/src/components/files/FilePreviewPanel.tsx:1246`（A，FilePreviewPanel）
- 同一文本作为值用途字面量出现 1 次：`apps/web/src/components/media/MediaActions.tsx:74`（error-constructor）

### `Type`（A，message，1 处）

- 显示位置（照常转换）：`apps/web/src/components/settings/DiagnosticsSettings.tsx:372`（A，ProcessDiagnosticsTable）
- 同一文本作为值用途字面量出现 21 次：`apps/server/src/textGeneration/ClaudeTextGeneration.ts:116`（ts-type）；`apps/server/src/textGeneration/CodexTextGeneration.ts:154`（ts-type）；`packages/contracts/src/baseSchemas.ts:160`（ts-type）；`packages/contracts/src/baseSchemas.ts:161`（ts-type）；`packages/contracts/src/baseSchemas.ts:172`（ts-type）；`packages/contracts/src/baseSchemas.ts:232`（ts-type）；`packages/contracts/src/baseSchemas.ts:276`（ts-type）；`packages/contracts/src/baseSchemas.ts:277`（ts-type）；`packages/contracts/src/baseSchemas.ts:281`（ts-type）；`packages/contracts/src/orchestrationV2.ts:780`（ts-type）；…（共 21 处）

### `Unknown`（A，message，1 处）

- 显示位置（照常转换）：`apps/web/src/components/device/DeviceToolsPanel.tsx:394`（A，ChoiceSelect）
- 同一文本作为值用途字面量出现 5 次：`apps/server/src/project/AgentSessionJson.ts:33`（switch-case）；`apps/server/src/provider/Drivers/CodexHomeLayout.ts:149`（comparison）；`apps/web/src/components/settings/ResourceTelemetryDiagnostics.tsx:1060`（never-attribute）；`packages/contracts/src/resourceTelemetry.ts:240`（schema-literal）；`packages/shared/src/symlink.ts:43`（error-constructor）

### `Worktree`（A，message，1 处）

- 显示位置（照常转换）：`apps/web/src/components/PullRequestThreadDialog.tsx:328`（A，PullRequestThreadDialog）
- 同一文本作为值用途字面量出现 3 次：`apps/server/src/project/AgentSessionScanner.ts:701`（ts-type）；`apps/server/src/project/AgentSessionScanner.ts:715`（as-const）；`apps/server/src/project/AgentSessionScanner.ts:1241`（comparison）

### `and`（A，message，1 处）

- 显示位置（照常转换）：`apps/web/src/components/settings/KeybindingsSettings.tsx:510`（A，WhenExpressionNodeEditor）
- 同一文本作为值用途字面量出现 13 次：`apps/server/src/keybindings.ts:185`（switch-case）；`apps/web/src/components/settings/KeybindingsSettings.logic.ts:103`（switch-case）；`apps/web/src/components/settings/KeybindingsSettings.logic.ts:317`（switch-case）；`apps/web/src/components/settings/KeybindingsSettings.tsx:150`（ts-type）；`apps/web/src/components/settings/KeybindingsSettings.tsx:487`（comparison）；`apps/web/src/components/settings/KeybindingsSettings.tsx:510`（never-attribute）；`apps/web/src/keybindings.ts:78`（switch-case）；`packages/client-runtime/src/work-log/commandLabel.ts:76`（membership）；`packages/client-runtime/src/work-log/commandLabel.ts:166`（membership）；`packages/contracts/src/keybindings.ts:181`（schema-literal）；…（共 13 处）

### `approval`（A，message，1 处）

- 显示位置（照常转换）：`apps/web/src/components/pullRequest/PullRequestDetailPanel.tsx:2707`（A，PullRequestDetailPanel）
- 同一文本作为值用途字面量出现 29 次：`apps/server/src/orchestration-v2/Adapters/ClaudeAdapterV2.ts:3001`（ts-type）；`apps/server/src/orchestration-v2/Adapters/CodexAdapterV2.ts:1235`（ts-type）；`apps/web/src/components/Sidebar.logic.ts:955`（ts-type）；`apps/web/src/components/Sidebar.logic.ts:972`（comparison）；`apps/web/src/components/Sidebar.logic.ts:1006`（ts-type）；`apps/web/src/components/Sidebar.logic.ts:1026`（comparison）；`apps/web/src/components/Sidebar.tsx:1267`（comparison）；`apps/web/src/components/Sidebar.tsx:1312`（comparison）；`apps/web/src/components/Sidebar.tsx:1315`（as-const）；`apps/web/src/components/Sidebar.tsx:2065`（comparison）；…（共 29 处）

### `approvals`（A，message，1 处）

- 显示位置（照常转换）：`apps/web/src/components/pullRequest/PullRequestDetailPanel.tsx:2707`（A，PullRequestDetailPanel）
- 同一文本作为值用途字面量出现 13 次：`apps/server/src/orchestration-v2/Adapters/ClaudeAdapterV2.ts:232`（object-key）；`apps/server/src/orchestration-v2/Adapters/CodexAdapterV2.ts:267`（object-key）；`apps/web/src/components/ChatView.tsx:3294`（object-key）；`apps/web/src/components/clerk/MobileClientsUserProfilePage.logic.ts:9`（as-const）；`packages/client-runtime/src/state/threadRequests.ts:40`（object-key）；`packages/client-runtime/src/state/threadRequests.ts:114`（object-key）；`packages/contracts/src/orchestrationV2.ts:325`（object-key）；`packages/provider-acp/src/server/adapter.ts:580`（object-key）；`packages/provider-cursor/src/server/adapter.ts:125`（object-key）；`packages/provider-muse/src/server/adapter.ts:133`（object-key）；…（共 13 处）

### `as`（A，message，1 处）

- 显示位置（照常转换）：`apps/web/src/components/settings/SourceControlSettings.tsx:237`（A，itemSummary）
- 同一文本作为值用途字面量出现 2 次：`apps/web/src/components/ChatMarkdown.tsx:751`（object-key）；`apps/web/src/components/ChatMarkdown.tsx:761`（object-key）

### `author`（A，message，1 处）

- 显示位置（照常转换）：`apps/web/src/components/pullRequest/PullRequestTimelineTab.tsx:332`（A，ConversationGroup）
- 同一文本作为值用途字面量出现 111 次：`apps/server/src/orchestration-v2/PullRequestSyncReactor.ts:62`（object-key）；`apps/server/src/orchestration-v2/pullRequestWatch.ts:46`（ts-type）；`apps/server/src/pullRequest/PullRequestService.ts:1195`（object-key）；`apps/server/src/pullRequest/PullRequestService.ts:1680`（object-key）；`apps/server/src/pullRequest/PullRequestService.ts:1766`（object-key）；`apps/server/src/pullRequest/PullRequestService.ts:1814`（object-key）；`apps/server/src/pullRequest/PullRequestService.ts:1853`（object-key）；`apps/server/src/pullRequest/PullRequestService.ts:2838`（object-key）；`apps/server/src/pullRequest/PullRequestService.ts:3083`（object-key）；`apps/web/src/components/pullRequest/PullRequestCodeTab.tsx:970`（object-key）；…（共 111 处）

### `authors`（A，message，1 处）

- 显示位置（照常转换）：`apps/web/src/components/pullRequest/PullRequestTimelineTab.tsx:332`（A，ConversationGroup）
- 同一文本作为值用途字面量出现 17 次：`apps/web/src/components/pullRequest/pullRequestList.logic.ts:125`（object-key）；`packages/contracts/src/acpRegistry.ts:64`（object-key）；`packages/contracts/src/pullRequest.ts:345`（object-key）；`packages/provider-acp-registry/src/server/AcpRegistrySupport.ts:138`（object-key）；`packages/provider-acp-registry/src/server/AcpRegistrySupport.ts:1606`（object-key）；`packages/source-control-bitbucket/src/server/bitbucketPullRequestJson.ts:536`（object-key）；`packages/source-control-forgejo/src/server/forgejoPullRequestJson.ts:204`（object-key）；`packages/source-control-gitcafe/src/server/GitCafePullRequestProvider.ts:530`（key-argument）；`packages/source-control-github/src/server/GitHubPullRequestProvider.ts:462`（object-key）；`packages/source-control-github/src/server/gitHubPullRequestJson.ts:412`（object-key）；…（共 17 处）

### `auto-settle`（B，message，1 处）

- 显示位置（照常转换）：`apps/web/src/components/settings/SettingsPanels.tsx:2444`（B，GeneralSettingsPanel）
- 同一文本作为值用途字面量出现 2 次：`apps/web/src/components/threadActionMenu.logic.ts:17`（ts-type）；`apps/web/src/components/threadActionMenu.logic.ts:201`（as-const）

### `available`（A，message，1 处）

- 显示位置（照常转换）：`apps/web/src/components/device/DeviceHostAvailability.tsx:17`（A，DeviceHostAvailability）
- 同一文本作为值用途字面量出现 108 次：`apps/desktop/src/ipc/methods/wsl.ts:32`（object-key）；`apps/desktop/src/snapShot/DesktopSnapShot.ts:696`（object-key）；`apps/desktop/src/snapShot/DesktopSnapShot.ts:701`（object-key）；`apps/desktop/src/snapShot/DesktopSnapShot.ts:703`（object-key）；`apps/desktop/src/snapShot/DesktopSnapShot.ts:1016`（object-key）；`apps/desktop/src/snapShot/DesktopSnapShot.ts:1020`（object-key）；`apps/desktop/src/snapShot/DesktopSnapShot.ts:1026`（object-key）；`apps/desktop/src/snapShot/DesktopSnapShot.ts:1032`（object-key）；`apps/desktop/src/snapShot/DesktopSnapShot.ts:1046`（object-key）；`apps/desktop/src/snapShot/DesktopSnapShot.ts:1053`（object-key）；…（共 108 处）

### `base64`（A，message，1 处）

- 显示位置（照常转换）：`apps/web/src/components/settings/ScheduledTasksSettings.tsx:1257`（A，ScheduledTaskEditorDialog）
- 同一文本作为值用途字面量出现 15 次：`apps/desktop/src/preview/FaviconCapture.ts:219`（comparison）；`apps/desktop/src/preview/FaviconCapture.ts:220`（membership）；`apps/desktop/src/preview/FaviconCapture.ts:227`（comparison）；`apps/server/src/htmlRender/HtmlRender.ts:298`（as-const）；`apps/server/src/imageMime.ts:56`（object-key）；`apps/server/src/imageMime.ts:76`（comparison）；`apps/server/src/imageMime.ts:113`（object-key）；`apps/server/src/orchestration-v2/toolOutputImageBytes.ts:9`（membership）；`apps/server/src/orchestration-v2/toolOutputImageBytes.ts:35`（comparison）；`apps/web/src/components/settings/ScheduledTasksSettings.tsx:1248`（comparison）；…（共 15 处）

### `chain`（A，message，1 处）

- 显示位置（照常转换）：`apps/web/src/components/ThreadStatusIndicators.tsx:380`（A，ThreadPullRequestsMiniList）
- 同一文本作为值用途字面量出现 5 次：`apps/web/src/components/ComposerPromptEditorTiptap.tsx:572`（object-key）；`apps/web/src/components/ComposerPromptEditorTiptap.tsx:600`（object-key）；`apps/web/src/components/ComposerPromptEditorTiptap.tsx:645`（object-key）；`apps/web/src/components/ComposerPromptEditorTiptap.tsx:666`（object-key）；`apps/web/src/components/ComposerPromptEditorTiptap.tsx:699`（object-key）

### `cost`（A，message，1 处）

- 显示位置（照常转换）：`apps/web/src/components/usage/UsagePage.tsx:718`（A，UsagePage）
- 同一文本作为值用途字面量出现 25 次：`apps/server/src/textGeneration/OpenCode2TextGeneration.fixture.ts:44`（object-key）；`apps/server/src/textGeneration/OpenCode2TextGeneration.fixture.ts:321`（object-key）；`apps/server/src/textGeneration/OpenCode2TextGeneration.fixture.ts:341`（object-key）；`apps/web/src/components/usage/UsagePage.tsx:586`（comparison）；`apps/web/src/components/usage/UsagePage.tsx:594`（comparison）；`apps/web/src/components/usage/UsagePage.tsx:651`（comparison）；`apps/web/src/components/usage/UsagePage.tsx:693`（comparison）；`apps/web/src/components/usage/UsagePage.tsx:706`（comparison）；`apps/web/src/components/usage/UsageProviderChart.tsx:23`（ts-type）；`apps/web/src/components/usage/usageBreakdown.ts:21`（ts-type）；…（共 25 处）

### `custom`（A，message，1 处）

- 显示位置（照常转换）：`apps/web/src/components/settings/ProviderModelsSection.tsx:491`（A，renderRow）
- 同一文本作为值用途字面量出现 79 次：`apps/server/src/git/GitManager.ts:800`（switch-case）；`apps/server/src/orchestration-v2/ThreadLaunchService.ts:361`（comparison）；`apps/web/src/components/settings/BranchNamingSettings.tsx:19`（object-key）；`apps/web/src/components/settings/BranchNamingSettings.tsx:117`（comparison）；`apps/web/src/components/settings/SettingInheritance.tsx:34`（object-key）；`apps/web/src/components/settings/SettingsPanels.logic.ts:192`（comparison）；`apps/web/src/components/settings/SettingsPanels.logic.ts:204`（comparison）；`apps/web/src/components/settings/SettingsPanels.logic.ts:323`（as-const）；`apps/web/src/components/settings/SourceControlSettings.tsx:130`（as-const）；`apps/web/src/components/settings/SourceControlWritingSettings.tsx:54`（object-key）；…（共 79 处）

### `days`（A，message，1 处）

- 显示位置（照常转换）：`apps/web/src/components/settings/StorageSettings.tsx:149`（A，RetentionControl）
- 同一文本作为值用途字面量出现 26 次：`apps/server/src/auth/EnvironmentAuth.ts:806`（object-key）；`apps/server/src/scheduledTasks/Schedule.ts:30`（object-key）；`apps/server/src/storageCleanup.ts:650`（object-key）；`apps/server/src/storageCleanup.ts:656`（object-key）；`apps/web/src/components/CustomSnoozeDialog.tsx:64`（ts-type）；`apps/web/src/components/CustomSnoozeDialog.tsx:189`（object-key）；`apps/web/src/components/CustomSnoozeDialog.tsx:191`（comparison）；`apps/web/src/components/CustomSnoozeDialog.tsx:202`（never-attribute）；`apps/web/src/components/usage/UsageModelDialog.tsx:29`（object-key）；`apps/web/src/components/usage/UsagePage.tsx:127`（object-key）；…（共 26 处）

### `folder`（A，message，1 处）

- 显示位置（照常转换）：`apps/web/src/components/onboarding/WelcomeWizard.tsx:1616`（A，ImportCandidateList）
- 同一文本作为值用途字面量出现 10 次：`apps/server/src/project/ManagedProjectFolders.ts:45`（object-key）；`apps/server/src/project/ManagedProjectFolders.ts:71`（object-key）；`apps/server/src/project/ManagedProjectFolders.ts:280`（object-key）；`apps/server/src/project/ManagedProjectFolders.ts:367`（object-key）；`apps/server/src/project/ManagedProjectFolders.ts:369`（object-key）；`apps/server/src/project/ManagedProjectFolders.ts:385`（object-key）；`apps/server/src/project/ManagedProjectFolders.ts:401`（object-key）；`apps/server/src/project/ManagedProjectFolders.ts:405`（object-key）；`apps/server/src/project/ManagedProjectFolders.ts:464`（object-key）；`apps/web/src/contextMenuFallback.ts:40`（object-key）

### `folders`（A，message，1 处）

- 显示位置（照常转换）：`apps/web/src/components/onboarding/WelcomeWizard.tsx:1616`（A，ImportCandidateList）
- 同一文本作为值用途字面量出现 4 次：`apps/web/src/components/chat/workspaceFileDrop.ts:35`（object-key）；`apps/web/src/components/chat/workspaceFileDrop.ts:38`（object-key）；`apps/web/src/components/chat/workspaceFileDrop.ts:52`（object-key）；`apps/web/src/components/chat/workspaceFileDrop.ts:79`（object-key）

### `gh auth login`（A，message，1 处）

- 显示位置（照常转换）：`apps/web/src/components/settings/GitHubAccountSettings.tsx:79`（A，GitHubAccountSettings）
- 同一文本作为值用途字面量出现 1 次：`apps/server/src/vcs/VcsProcess.ts:71`（membership）

### `ghost`（A，message，1 处）

- 显示位置（照常转换）：`apps/web/src/components/pullRequest/PullRequestTimelineTab.tsx:93`（A，ActorName）
- 同一文本作为值用途字面量出现 11 次：`apps/web/src/components/chat/MessageCopyButton.tsx:25`（ts-type）；`apps/web/src/components/chat/MessageCopyButton.tsx:47`（comparison）；`apps/web/src/components/ui/button.tsx:48`（object-key）；`apps/web/src/components/ui/input-group.tsx:27`（object-key）；`apps/web/src/components/ui/menu.tsx:83`（ts-type）；`apps/web/src/components/ui/menu.tsx:89`（comparison）；`apps/web/src/components/ui/menu.tsx:91`（non-display-call）；`apps/web/src/components/ui/select.tsx:24`（object-key）；`apps/web/src/components/ui/toast.tsx:51`（ts-type）；`apps/web/src/components/ui/toast.tsx:65`（ts-type）；…（共 11 处）

### `hex`（A，message，1 处）

- 显示位置（照常转换）：`apps/web/src/components/settings/ScheduledTasksSettings.tsx:1256`（A，ScheduledTaskEditorDialog）
- 同一文本作为值用途字面量出现 9 次：`apps/server/src/preview/PreviewBrowser.ts:243`（comparison）；`apps/server/src/provider/AntigravityInstallation.ts:539`（comparison）；`apps/server/src/provider/CodexInstallation.ts:500`（comparison）；`apps/server/src/scheduledTasks/webhookVerification.ts:31`（comparison）；`apps/server/src/scheduledTasks/webhookVerification.ts:34`（comparison）；`apps/web/src/components/settings/ScheduledTasksSettings.tsx:1256`（never-attribute）；`apps/web/src/components/settings/scheduledTasksSettings.logic.ts:78`（ts-type）；`apps/web/src/components/settings/scheduledTasksSettings.logic.ts:89`（as-const）；`packages/contracts/src/scheduledTask.ts:63`（schema-literal）

### `left`（A，message，1 处）

- 显示位置（照常转换）：`apps/web/src/components/usage/UsageLimitsPooled.tsx:517`（A，PoolWindowCard）
- 同一文本作为值用途字面量出现 139 次：`apps/desktop/src/preview/PickPreload.ts:656`（object-key）；`apps/desktop/src/preview/PickPreload.ts:1006`（object-key）；`apps/desktop/src/preview/PickPreload.ts:1010`（object-key）；`apps/desktop/src/preview/PickPreload.ts:1021`（object-key）；`apps/desktop/src/preview/PickPreload.ts:1049`（object-key）；`apps/desktop/src/preview/PickPreload.ts:1050`（object-key）；`apps/desktop/src/preview/PickPreload.ts:1052`（object-key）；`apps/desktop/src/preview/PickPreload.ts:1056`（object-key）；`apps/desktop/src/preview/PickPreload.ts:1060`（object-key）；`apps/desktop/src/preview/PickPreload.ts:1086`（object-key）；…（共 139 处）

### `minutes`（A，message，1 处）

- 显示位置（照常转换）：`apps/web/src/components/settings/ScheduledTasksSettings.tsx:1335`（A，ScheduledTaskEditorDialog）
- 同一文本作为值用途字面量出现 11 次：`apps/server/src/cli/trace.ts:116`（object-key）；`apps/server/src/cloud/CloudLink.ts:643`（object-key）；`apps/server/src/cloud/CloudLink.ts:1515`（object-key）；`apps/server/src/orchestration-v2/PullRequestWatchReactor.ts:274`（object-key）；`apps/server/src/relay/AgentAwarenessRelay.ts:261`（object-key）；`apps/web/src/components/CustomSnoozeDialog.tsx:64`（ts-type）；`apps/web/src/components/CustomSnoozeDialog.tsx:189`（object-key）；`apps/web/src/components/CustomSnoozeDialog.tsx:191`（comparison）；`apps/web/src/components/CustomSnoozeDialog.tsx:200`（never-attribute）；`packages/client-runtime/src/state/threadSettled.ts:326`（ts-type）；…（共 11 处）

### `none`（A，message，1 处）

- 显示位置（照常转换）：`apps/web/src/components/GitActionsControl.tsx:2054`（A，GitActionsControl）
- 同一文本作为值用途字面量出现 138 次：`apps/desktop/src/electron/ElectronDialog.ts:42`（schema-literal）；`apps/desktop/src/preview/FaviconCapture.ts:37`（ts-type）；`apps/desktop/src/preview/Manager.ts:112`（ts-type）；`apps/desktop/src/preview/PickPreload.ts:64`（comparison）；`apps/desktop/src/preview/PickPreload.ts:84`（comparison）；`apps/desktop/src/preview/PickPreload.ts:1075`（comparison）；`apps/desktop/src/preview/RecordingCursor.ts:44`（ts-type）；`apps/server/src/auth/mcpOAuthHttp.ts:83`（as-const）；`apps/server/src/cloud/managedTunnelStartup.ts:14`（ts-type）；`apps/server/src/device/DeviceActions.ts:527`（comparison）；…（共 138 处）

### `now`（A，message，1 处）

- 显示位置（照常转换）：`apps/web/src/components/chat/ComposerTasksBadge.tsx:209`（A，ComposerTasksContent）
- 同一文本作为值用途字面量出现 158 次：`apps/server/src/auth/PairingGrantStore.ts:358`（object-key）；`apps/server/src/auth/PairingGrantStore.ts:570`（object-key）；`apps/server/src/auth/SessionStore.ts:977`（object-key）；`apps/server/src/background/BackgroundPolicy.ts:184`（object-key）；`apps/server/src/background/BackgroundPolicy.ts:231`（object-key）；`apps/server/src/mcp/McpSessionRegistry.ts:65`（object-key）；`apps/server/src/orchestration-v2/Adapters/ClaudeAdapterV2.ts:1045`（object-key）；`apps/server/src/orchestration-v2/Adapters/ClaudeAdapterV2.ts:1160`（object-key）；`apps/server/src/orchestration-v2/Adapters/ClaudeAdapterV2.ts:3183`（object-key）；`apps/server/src/orchestration-v2/Adapters/ClaudeAdapterV2.ts:4474`（object-key）；…（共 158 处）

### `optionId`（B，message，1 处）

- 显示位置（照常转换）：`apps/web/src/components/settings/CustomModelEditor.tsx:233`（B，renderDescriptor）
- 同一文本作为值用途字面量出现 19 次：`apps/server/src/provider/acp/AntigravityProtocol.ts:172`（object-key）；`apps/server/src/provider/acp/AntigravityProtocol.ts:176`（object-key）；`apps/web/src/components/chat/ComposerCommandMenu.tsx:161`（object-key）；`packages/effect-acp/src/_generated/schema-v1.gen.ts:3112`（object-key）；`packages/effect-acp/src/_generated/schema-v1.gen.ts:3122`（object-key）；`packages/effect-acp/src/_generated/schema-v1.gen.ts:3141`（object-key）；`packages/effect-acp/src/_generated/schema-v1.gen.ts:3147`（object-key）；`packages/effect-acp/src/_generated/schema-v1.gen.ts:9035`（object-key）；`packages/effect-acp/src/_generated/schema-v1.gen.ts:9039`（object-key）；`packages/effect-acp/src/_generated/schema.gen.ts:3169`（object-key）；…（共 19 处）

### `or`（A，message，1 处）

- 显示位置（照常转换）：`apps/web/src/components/settings/KeybindingsSettings.tsx:511`（A，WhenExpressionNodeEditor）
- 同一文本作为值用途字面量出现 13 次：`apps/server/src/keybindings.ts:187`（switch-case）；`apps/web/src/components/settings/KeybindingsSettings.logic.ts:105`（switch-case）；`apps/web/src/components/settings/KeybindingsSettings.logic.ts:318`（switch-case）；`apps/web/src/components/settings/KeybindingsSettings.tsx:150`（ts-type）；`apps/web/src/components/settings/KeybindingsSettings.tsx:435`（comparison）；`apps/web/src/components/settings/KeybindingsSettings.tsx:511`（never-attribute）；`apps/web/src/keybindings.ts:80`（switch-case）；`packages/client-runtime/src/work-log/commandLabel.ts:128`（membership）；`packages/client-runtime/src/work-log/commandLabel.ts:191`（membership）；`packages/contracts/src/keybindings.ts:186`（schema-literal）；…（共 13 处）

### `origin`（B，message，1 处）

- 显示位置（照常转换）：`apps/web/src/components/GitActionsControl.tsx:938`（B，PublishRepositoryDialog）
- 同一文本作为值用途字面量出现 115 次：`apps/desktop/src/electron/ElectronProtocol.ts:187`（comparison）；`apps/desktop/src/preview/PasskeyBackend.ts:6`（object-key）；`apps/desktop/src/preview/Passkeys.ts:209`（object-key）；`apps/server/src/cli/pair.ts:177`（object-key）；`apps/server/src/cli/pair.ts:534`（object-key）；`apps/server/src/cli/project.ts:353`（object-key）；`apps/server/src/cli/project.ts:359`（object-key）；`apps/server/src/cli/project.ts:370`（object-key）；`apps/server/src/cli/project.ts:374`（object-key）；`apps/server/src/cli/sshHelper.ts:101`（object-key）；…（共 115 处）

### `outdated`（A，message，1 处）

- 显示位置（照常转换）：`apps/web/src/components/pullRequest/PullRequestReviewAnnotation.tsx:231`（A，ReviewThreadCard）
- 同一文本作为值用途字面量出现 1 次：`packages/source-control-bitbucket/src/server/bitbucketPullRequestJson.ts:114`（object-key）

### `override`（B，message，1 处）

- 显示位置（照常转换）：`apps/web/src/components/settings/settingsLayout.tsx:363`（B，SettingsRow）
- 同一文本作为值用途字面量出现 4 次：`apps/server/src/provider/AntigravityInstallation.ts:75`（ts-type）；`apps/server/src/provider/AntigravityInstallation.ts:247`（ts-type）；`packages/contracts/src/relayClient.ts:7`（schema-literal）；`packages/shared/src/relayClient.ts:38`（ts-type）

### `process`（A，message，1 处）

- 显示位置（照常转换）：`apps/web/src/components/settings/ResourceTelemetryDiagnostics.tsx:280`（A，AggregateCard）
- 同一文本作为值用途字面量出现 55 次：`apps/desktop/src/wsl/DesktopWslEnvironment.ts:160`（ts-type）；`apps/desktop/src/wsl/DesktopWslEnvironment.ts:179`（switch-case）；`apps/server/src/resourceTelemetry/Model.ts:17`（object-key）；`apps/server/src/resourceTelemetry/Model.ts:563`（object-key）；`apps/server/src/resourceTelemetry/ResourceTelemetryHistory.ts:45`（object-key）；`apps/server/src/resourceTelemetry/ResourceTelemetryHistory.ts:266`（object-key）；`apps/server/src/serviceLauncher.ts:43`（object-key）；`apps/server/src/serviceLauncher.ts:450`（object-key）；`apps/server/src/sourceControl/ServerSourceControlHost.ts:25`（object-key）；`apps/server/src/sourceControl/SourceControlProviderRegistry.ts:200`（object-key）；…（共 55 处）

### `processes`（A，message，1 处）

- 显示位置（照常转换）：`apps/web/src/components/settings/ResourceTelemetryDiagnostics.tsx:280`（A，AggregateCard）
- 同一文本作为值用途字面量出现 20 次：`apps/server/src/diagnostics/ProcessDiagnostics.ts:84`（object-key）；`apps/server/src/resourceTelemetry/Model.ts:59`（object-key）；`apps/server/src/resourceTelemetry/Model.ts:597`（object-key）；`apps/server/src/resourceTelemetry/NativeTelemetryClient.ts:680`（object-key）；`apps/server/src/resourceTelemetry/NativeTelemetryClient.ts:853`（object-key）；`apps/server/src/resourceTelemetry/ResourceTelemetry.ts:187`（object-key）；`apps/server/src/resourceTelemetry/ResourceTelemetry.ts:300`（object-key）；`apps/web/src/components/settings/DiagnosticsSettings.tsx:302`（object-key）；`apps/web/src/components/settings/DiagnosticsSettings.tsx:308`（object-key）；`apps/web/src/components/settings/DiagnosticsSettings.tsx:561`（object-key）；…（共 20 处）

### `root`（B，message，1 处）

- 显示位置（照常转换）：`apps/web/src/components/settings/ConnectionsSettings.tsx:3105`（B，renderSshFields）
- 同一文本作为值用途字面量出现 105 次：`apps/desktop/src/snapShot/SnapShotAccessibility.ts:46`（ts-type）；`apps/desktop/src/snapShot/SnapShotAccessibility.ts:74`（object-key）；`apps/desktop/src/snapShot/SnapShotAccessibility.ts:88`（object-key）；`apps/desktop/src/snapShot/snapShot.ts:304`（object-key）；`apps/desktop/src/snapShot/snapShot.ts:340`（object-key）；`apps/desktop/src/snapShot/snapShot.ts:359`（object-key）；`apps/desktop/src/snapShot/snapShot.ts:439`（object-key）；`apps/desktop/src/wsl/DesktopWslServerTree.ts:24`（object-key）；`apps/desktop/src/wsl/DesktopWslServerTree.ts:206`（object-key）；`apps/desktop/src/wsl/DesktopWslServerTree.ts:210`（object-key）；…（共 105 处）

### `server`（B，message，1 处）

- 显示位置（照常转换）：`apps/web/src/components/settings/ConnectionsSettings.tsx:3678`（B，ConnectionsSettings）
- 同一文本作为值用途字面量出现 223 次：`apps/desktop/src/app/DesktopAppActivation.ts:218`（object-key）；`apps/desktop/src/app/DesktopAppActivation.ts:232`（object-key）；`apps/desktop/src/app/DesktopAppActivation.ts:252`（object-key）；`apps/server/src/cli/triage.ts:199`（object-key）；`apps/server/src/cli/triagePrompt.ts:174`（object-key）；`apps/server/src/diagnostics/ProcessResourceMonitor.ts:24`（comparison）；`apps/server/src/diagnostics/ProcessResourceMonitor.ts:45`（comparison）；`apps/server/src/htmlRender/publicProxy.ts:149`（object-key）；`apps/server/src/htmlRender/publicProxy.ts:231`（object-key）；`apps/server/src/htmlRender/publicProxy.ts:234`（object-key）；…（共 223 处）

### `setup`（A，message，1 处）

- 显示位置（照常转换）：`apps/web/src/components/settings/ProjectActionsList.tsx:38`（A，ProjectActionsList）
- 同一文本作为值用途字面量出现 14 次：`apps/desktop/src/snapShot/DesktopSnapShot.ts:176`（object-key）；`apps/desktop/src/snapShot/DesktopSnapShot.ts:1520`（object-key）；`apps/server/src/project/ProjectSetupScriptRunner.ts:65`（ts-type）；`apps/server/src/provider/AntigravityProvider.ts:155`（object-key）；`apps/server/src/provider/Drivers/CodexManagedProvider.ts:59`（object-key）；`apps/server/src/provider/Drivers/CodexManagedProvider.ts:153`（object-key）；`apps/web/src/components/files/useFileSaveCoordinator.ts:35`（object-key）；`apps/web/src/components/settings/ProviderInstanceCard.tsx:501`（object-key）；`apps/web/src/components/settings/ProviderInstanceCard.tsx:557`（object-key）；`apps/web/src/components/settings/ProviderWizardAuthenticationStep.tsx:50`（object-key）；…（共 14 处）

### `stack`（A，message，1 处）

- 显示位置（照常转换）：`apps/web/src/components/ThreadStatusIndicators.tsx:380`（A，ThreadPullRequestsMiniList）
- 同一文本作为值用途字面量出现 66 次：`apps/desktop/src/preview/PickPreload.ts:447`（object-key）；`apps/desktop/src/preview/PickPreload.ts:460`（object-key）；`apps/desktop/src/preview/PickedElementPayload.ts:46`（computed-key）；`apps/desktop/src/preview/PickedElementPayload.ts:47`（computed-key）；`apps/server/src/git/detachStackFrame.ts:9`（object-key）；`apps/server/src/mcp/toolkits/pullRequests/handlers.ts:115`（ts-type）；`apps/server/src/mcp/toolkits/pullRequests/handlers.ts:136`（object-key）；`apps/server/src/mcp/toolkits/pullRequests/tools.ts:227`（object-key）；`apps/server/src/orchestration-v2/Orchestrator.ts:562`（object-key）；`apps/server/src/orchestration-v2/Orchestrator.ts:3002`（comparison）；…（共 66 处）

### `team`（A，message，1 处）

- 显示位置（照常转换）：`apps/web/src/components/pullRequest/PullRequestReviewerPicker.tsx:125`（A，PullRequestReviewerPicker）
- 同一文本作为值用途字面量出现 6 次：`apps/server/src/provider/ClaudeProvider.ts:102`（switch-case）；`apps/server/src/provider/CodexProvider.ts:129`（switch-case）；`apps/web/src/components/pullRequest/PullRequestReviewerPicker.tsx:124`（comparison）；`packages/contracts/src/pullRequest.ts:286`（schema-literal）；`packages/provider-cursor/src/server/adapter.ts:300`（as-const）；`packages/source-control-github/src/server/gitHubPullRequestJson.ts:3047`（comparison）

### `unavailable`（A，message，1 处）

- 显示位置（照常转换）：`apps/web/src/components/device/DeviceHostAvailability.tsx:17`（A，DeviceHostAvailability）
- 同一文本作为值用途字面量出现 97 次：`apps/desktop/src/backend/DesktopServerExposure.ts:306`（object-key）；`apps/desktop/src/backend/DesktopServerExposure.ts:406`（object-key）；`apps/desktop/src/preview/BrowserImport/BrowserImport.ts:192`（object-key）；`apps/desktop/src/snapShot/DesktopSnapShot.ts:863`（comparison）；`apps/desktop/src/snapShot/DesktopSnapShot.ts:1015`（comparison）；`apps/desktop/src/snapShot/DesktopSnapShot.ts:1089`（comparison）；`apps/desktop/src/snapShot/DesktopSnapShot.ts:1100`（comparison）；`apps/desktop/src/snapShot/DesktopSnapShot.ts:1103`（comparison）；`apps/desktop/src/snapShot/DesktopSnapShot.ts:1135`（comparison）；`apps/desktop/src/snapShot/DesktopSnapShot.ts:1142`（comparison）；…（共 97 处）

### `viewed`（A，message，1 处）

- 显示位置（照常转换）：`apps/web/src/components/pullRequest/PullRequestCodeTab.tsx:1162`（A，PullRequestCodeTab）
- 同一文本作为值用途字面量出现 14 次：`apps/server/src/persistence/PullRequestFilesViewed.ts:48`（object-key）；`apps/server/src/pullRequest/pullRequestViewedFiles.ts:276`（as-const）；`apps/server/src/pullRequest/pullRequestViewedFiles.ts:284`（as-const）；`apps/server/src/pullRequest/pullRequestViewedFiles.ts:363`（object-key）；`apps/web/src/components/pullRequest/pullRequestFilesViewed.logic.ts:22`（comparison）；`apps/web/src/components/pullRequest/pullRequestFilesViewed.logic.ts:84`（object-key）；`apps/web/src/components/pullRequest/pullRequestFilesViewed.logic.ts:88`（object-key）；`apps/web/src/components/pullRequest/pullRequestFilesViewed.logic.ts:98`（object-key）；`apps/web/src/components/pullRequest/pullRequestFilesViewed.logic.ts:99`（object-key）；`packages/contracts/src/pullRequest.ts:1057`（schema-literal）；…（共 14 处）
