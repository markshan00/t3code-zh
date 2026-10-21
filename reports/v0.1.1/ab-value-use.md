# A/B 值用途重名 v0.1.1

A（JSX 文本/子表达式）和 B 原始白名单属性的文字，即使同一文本也出现在「从不转换」的值用途位置（比较、`switch case`、`as const`、字面量类型、对象键），仍照常转换——它们只用于显示。§4 要求把这些位置列出以便人工核对：若上游将来改成拿这些字段做判断，就需要改判定。

共 243 处显示位置（131 条文字）。此清单与 suspicious、可翻译计数分开统计，不计入可翻译位置总数。

### `Off`（A，message，12 处）

- 显示位置（照常转换）：`apps/web/src/components/chat/TraitsPicker.tsx:548`（A，TraitsMenuContent）；`apps/web/src/components/clerk/MobileClientsUserProfilePage.tsx:31`（A，MobileClientStatusBadge）；`apps/web/src/components/onboarding/WelcomeWizard.tsx:365`（A，ConnectionStep）；`apps/web/src/components/settings/ConnectionsSettings.tsx:3307`（A，renderWslRow）；`apps/web/src/components/settings/GitHubRoutingSettings.tsx:62`（B，GitHubRoutingSettings）；`apps/web/src/components/settings/LoadBalancingSettings.tsx:68`（B，LoadBalancingSettings）；`apps/web/src/components/settings/ProviderInstanceCard.tsx:544`（A，ProjectOverrideInheritance）；`apps/web/src/components/settings/SnapShotSettings.tsx:525`（A，SnapShotSettings）；`apps/web/src/components/settings/SnapShotSettings.tsx:542`（A，SnapShotSettings）；`apps/web/src/components/settings/StorageSettings.tsx:159`（A，RetentionControl）；`apps/web/src/components/settings/StorageSettings.tsx:539`（A，StorageSettingsPanel）；`apps/web/src/components/settings/StorageSettings.tsx:545`（A，StorageSettingsPanel）
- 同一文本作为值用途字面量出现 2 次：`packages/shared/src/otelEnvironment.ts:15`（object-key）；`packages/shared/src/otelEnvironment.ts:356`（object-key）

### `Close`（B，message，8 处）

- 显示位置（照常转换）：`apps/web/src/components/chat/HtmlRenderDialog.tsx:30`（B，HtmlRenderDialog）；`apps/web/src/components/files/AttachmentFilePreview.tsx:324`（B，AttachmentFilePreview）；`apps/web/src/components/onboarding/WelcomeWizard.tsx:1146`（A，AgentInstallTerminal）；`apps/web/src/components/settings/BrowserImportWizard.tsx:574`（A，BlockedStep）；`apps/web/src/components/settings/ProjectFaviconPickerDialog.tsx:87`（B，ProjectFaviconPickerDialog）；`apps/web/src/components/settings/SnapShotSetupDialog.tsx:389`（A，SnapShotSetupDialog）；`apps/web/src/components/ui/dialog.tsx:96`（B，DialogPopup）；`apps/web/src/components/ui/sheet.tsx:110`（B，SheetPopup）
- 同一文本作为值用途字面量出现 2 次：`apps/desktop/src/backend/DesktopBackendPool.ts:99`（ts-type）；`apps/desktop/src/backend/DesktopBackendPool.ts:276`（as-const）

### `Default`（A，message，6 处）

- 显示位置（照常转换）：`apps/web/src/components/chat/TraitsPicker.tsx:103`（A，DefaultBadge）；`apps/web/src/components/settings/ConnectionsSettings.tsx:1350`（A，AdvertisedEndpointListRow）；`apps/web/src/components/settings/CustomModelEditor.tsx:168`（A，renderChoice）；`apps/web/src/components/settings/DeviceHostEditor.tsx:178`（B，DeviceHostEditorForm）；`apps/web/src/components/settings/IntegrationsSettings.tsx:1438`（A，BrowserProfilesSetting）；`apps/web/src/components/settings/StorageSettings.tsx:90`（B，WorktreesDirectoryRow）
- 同一文本作为值用途字面量出现 4 次：`apps/web/src/components/device/DeviceControlsRail.tsx:166`（as-const）；`apps/web/src/components/settings/KeybindingsSettings.logic.ts:44`（ts-type）；`apps/web/src/components/settings/KeybindingsSettings.tsx:894`（comparison）；`apps/web/src/components/settings/KeybindingsSettings.tsx:929`（comparison）

### `Mixed`（B，message，6 处）

- 显示位置（照常转换）：`apps/web/src/components/settings/BranchNamingSettings.tsx:105`（B，BranchNamingSettings）；`apps/web/src/components/settings/ProjectDefaultsSettings.tsx:308`（A，ProjectDefaultsSettings）；`apps/web/src/components/settings/SettingsPanels.tsx:3051`（B，GeneralSettingsPanel）；`apps/web/src/components/settings/StorageSettings.tsx:90`（B，WorktreesDirectoryRow）；`apps/web/src/components/settings/StorageSettings.tsx:535`（A，StorageSettingsPanel）；`apps/web/src/components/settings/StorageSettings.tsx:666`（A，StorageSettingsPanel）
- 同一文本作为值用途字面量出现 1 次：`apps/web/src/components/usage/UsagePriceOverrides.tsx:205`（comparison）

### `None`（A，message，6 处）

- 显示位置（照常转换）：`apps/web/src/components/AddProjectToMachineDialog.tsx:331`（A，AddProjectToMachineDialog）；`apps/web/src/components/device/DeviceToolVersions.tsx:69`（A，DeviceToolVersions）；`apps/web/src/components/pullRequest/PullRequestGhosts.tsx:322`（A，PullRequestDetailGhost）；`apps/web/src/components/pullRequest/PullRequestSummaryTab.tsx:668`（A，PullRequestSummaryTab）；`apps/web/src/components/pullRequest/PullRequestSummaryTab.tsx:739`（A，PullRequestSummaryTab）；`apps/web/src/components/settings/ScheduledTasksSettings.tsx:1636`（B，ScheduledTaskEditorForm）
- 同一文本作为值用途字面量出现 22 次：`apps/server/src/device/LocalDeviceHost.ts:360`（comparison）；`apps/server/src/process/agentScope.ts:133`（comparison）；`apps/server/src/process/agentScope.ts:143`（comparison）；`apps/server/src/process/agentScope.ts:185`（comparison）；`apps/server/src/process/agentScope.ts:213`（comparison）；`apps/server/src/project/RepositoryIdentityResolver.ts:161`（comparison）；`apps/server/src/project/RepositoryIdentityResolver.ts:188`（comparison）；`apps/server/src/project/RepositoryIdentityResolver.ts:217`（comparison）；`apps/server/src/vcs/VcsStatusBroadcaster.ts:177`（comparison）；`apps/server/src/workspace/WorkspaceFileSystem.ts:147`（comparison）；…（共 22 处）

### `Sign in`（A，message，6 处）

- 显示位置（照常转换）：`apps/web/src/components/HostedEmptyState.tsx:86`（A，T3ConnectSteps）；`apps/web/src/components/cloud/ConnectCliAuthSurface.tsx:102`（A，ConnectCliAuthorizeSurface）；`apps/web/src/components/onboarding/WelcomeWizard.tsx:502`（A，ConnectAccountOption）；`apps/web/src/components/onboarding/WelcomeWizard.tsx:1001`（A，AgentCard）；`apps/web/src/components/settings/ProviderAuthenticationSection.tsx:296`（A，ProviderAuthenticationSection）；`apps/web/src/components/settings/ProviderWizardAuthenticationStep.tsx:70`（A，ProviderWizardAuthenticationStep）
- 同一文本作为值用途字面量出现 1 次：`apps/web/src/components/settings/AddProviderInstanceDialog.logic.ts:9`（as-const）

### `Dismiss`（A，message，5 处）

- 显示位置（照常转换）：`apps/web/src/browser/ServerBrowserSurface.tsx:848`（A，ServerBrowserSurface）；`apps/web/src/components/ChatView.tsx:5514`（B，ChatView）；`apps/web/src/components/desktop/SshPasswordPromptDialog.tsx:214`（A，ActiveSshPasswordPrompt）；`apps/web/src/components/settings/DatabaseStorageNotice.tsx:52`（A，DatabaseStorageNotice）；`apps/web/src/components/sidebar/SidebarUpdateCapsule.tsx:173`（A，SidebarUpdateCapsule）
- 同一文本作为值用途字面量出现 1 次：`apps/web/src/components/chat/ComposerBanner.tsx:354`（object-key）

### `Unavailable`（A，message，5 处）

- 显示位置（照常转换）：`apps/web/src/components/chat/ModelListRow.tsx:85`（A，ModelListRow）；`apps/web/src/components/chat/ProviderModelPicker.tsx:268`（A，ProviderModelPicker）；`apps/web/src/components/cloud/CloudEnvironmentConnectList.tsx:414`（A，CloudEnvironmentConnectRows）；`apps/web/src/components/settings/CodexSetupSection.tsx:1028`（B，CodexManagedRuntimeFields）；`apps/web/src/components/settings/CodexSetupSection.tsx:1047`（B，CodexManagedRuntimeFields）
- 同一文本作为值用途字面量出现 2 次：`apps/web/src/components/settings/ResourceTelemetryDiagnostics.tsx:1196`（never-attribute）；`apps/web/src/components/usage/UsagePriceOverrides.tsx:206`（comparison）

### `Actions`（A，message，4 处）

- 显示位置（照常转换）：`apps/web/src/components/ProjectScriptsControl.tsx:374`（A，ProjectScriptsControl）；`apps/web/src/components/ProjectScriptsControl.tsx:415`（A，ProjectScriptsControl）；`apps/web/src/components/settings/ProjectActionsSettings.tsx:119`（B，ProjectActionsSettings）；`apps/web/src/components/settings/ProjectActionsSettings.tsx:124`（B，ProjectActionsSettings）
- 同一文本作为值用途字面量出现 1 次：`apps/web/src/components/chat/ComposerBanner.tsx:347`（object-key）

### `Codex`（B，message，4 处）

- 显示位置（照常转换）：`apps/web/src/components/onboarding/WelcomeWizard.tsx:1749`（B，ImportRowMeta）；`apps/web/src/components/settings/CodexSetupSection.tsx:77`（B，CodexSetupSection）；`apps/web/src/components/settings/CodexSetupSection.tsx:137`（B，CodexSetupSection）；`apps/web/src/components/settings/CodexSetupSection.tsx:744`（B，ManagedCodexSetup）
- 同一文本作为值用途字面量出现 1 次：`apps/server/src/provider/CodexProvider.ts:82`（as-const）

### `Command`（A，message，4 处）

- 显示位置（照常转换）：`apps/web/src/components/projectScriptEditor.tsx:490`（A，ProjectScriptEditorForm）；`apps/web/src/components/settings/DiagnosticsSettings.tsx:373`（A，ProcessDiagnosticsTable）；`apps/web/src/components/settings/DiagnosticsSettings.tsx:602`（A，ProcessResourceHistoryTable）；`apps/web/src/components/settings/KeybindingsSettings.tsx:1106`（B，NewKeybindingCommandSelect）
- 同一文本作为值用途字面量出现 2 次：`apps/web/src/lib/embeddedScripts.ts:229`（switch-case）；`apps/web/src/shortcutModifierState.ts:80`（switch-case）

### `Loading`（A，message，4 处）

- 显示位置（照常转换）：`apps/web/src/components/settings/AcpSessionManagementSection.tsx:376`（A，AcpSessionManagementSection）；`apps/web/src/components/settings/AcpSessionManagementSection.tsx:449`（A，AcpSessionManagementSection）；`apps/web/src/components/settings/AcpSessionManagementSection.tsx:472`（A，AcpSessionManagementSection）；`apps/web/src/components/ui/spinner.tsx:31`（B，Spinner）
- 同一文本作为值用途字面量出现 11 次：`apps/desktop/src/preview/Manager.ts:90`（ts-type）；`apps/desktop/src/preview/Manager.ts:1907`（comparison）；`apps/desktop/src/preview/Manager.ts:1955`（comparison）；`apps/server/src/preview/ServerBrowser.ts:896`（comparison）；`apps/web/src/components/ChatMarkdown.tsx:1614`（comparison）；`apps/web/src/components/preview/PreviewView.tsx:228`（comparison）；`apps/web/src/components/preview/usePreviewBridge.ts:108`（comparison）；`apps/web/src/components/preview/usePreviewBridge.ts:108`（comparison）；`apps/web/src/components/preview/usePreviewBridge.ts:119`（comparison）；`packages/client-runtime/src/state/assets.ts:72`（ts-type）；…（共 11 处）

### `Project`（B，message，4 处）

- 显示位置（照常转换）：`apps/web/src/components/pullRequest/PullRequestListFilters.tsx:552`（B，PullRequestFiltersMenu）；`apps/web/src/components/settings/ProjectSettingsPanel.tsx:496`（B，ProjectDetail）；`apps/web/src/components/settings/ScheduledTasksSettings.tsx:1370`（B，ScheduledTaskEditorForm）；`apps/web/src/components/settings/StorageSettings.tsx:222`（A，CleanupResults）
- 同一文本作为值用途字面量出现 1 次：`apps/web/src/components/settings/KeybindingsSettings.logic.ts:44`（ts-type）

### `Ready`（A，message，4 处）

- 显示位置（照常转换）：`apps/web/src/components/device/DeviceSetup.tsx:384`（A，PlatformStatus）；`apps/web/src/components/onboarding/WelcomeWizard.tsx:985`（A，AgentCard）；`apps/web/src/components/settings/CodexSetupSection.tsx:107`（A，CodexSetupSection）；`apps/web/src/components/settings/CodexSetupSection.tsx:786`（A，ManagedCodexSetup）
- 同一文本作为值用途字面量出现 5 次：`apps/desktop/src/backend/DesktopBackendConfiguration.ts:265`（ts-type）；`apps/desktop/src/backend/DesktopBackendConfiguration.ts:406`（as-const）；`apps/desktop/src/backend/DesktopBackendConfiguration.ts:455`（as-const）；`apps/desktop/src/backend/DesktopBackendConfiguration.ts:646`（comparison）；`apps/desktop/src/backend/DesktopBackendConfiguration.ts:680`（comparison）

### `Branch`（A，message，3 处）

- 显示位置（照常转换）：`apps/web/src/components/DiffPanel.tsx:768`（A，DiffPanel）；`apps/web/src/components/GitActionsControl.tsx:1870`（A，GitActionsControl）；`apps/web/src/components/chat/WorktreeSetupCard.tsx:243`（A，SetupDetails）
- 同一文本作为值用途字面量出现 1 次：`apps/web/src/components/chat/SubagentTooltipContent.tsx:173`（comparison）

### `Delete`（A，message，3 处）

- 显示位置（照常转换）：`apps/web/src/components/projectScriptEditor.tsx:561`（A，ProjectScriptEditorForm）；`apps/web/src/components/settings/AcpSessionManagementSection.tsx:431`（A，AcpSessionManagementSection）；`apps/web/src/components/settings/ScheduledTasksSettings.tsx:778`（A，ScheduledTaskRow）
- 同一文本作为值用途字面量出现 10 次：`apps/desktop/src/preview/GuestInput.ts:55`（membership）；`apps/desktop/src/preview/RecordingInput.ts:31`（object-key）；`apps/web/src/browser/ServerBrowserSurface.tsx:63`（as-const）；`apps/web/src/browser/ServerBrowserSurface.tsx:63`（as-const）；`apps/web/src/browser/ServerBrowserSurface.tsx:690`（comparison）；`apps/web/src/components/projectScriptEditor.tsx:319`（comparison）；`apps/web/src/composer-rich-text-doc.ts:283`（object-key）；`apps/web/src/terminal/ghostty/keyCodes.ts:75`（as-const）；`packages/client-runtime/src/device/stream.ts:340`（object-key）；`packages/client-runtime/src/device/stream.ts:370`（object-key）

### `Enter`（A，message，3 处）

- 显示位置（照常转换）：`apps/web/src/components/CommandPalette.tsx:3155`（A，OpenCommandPaletteDialog）；`apps/web/src/components/CommandPalette.tsx:3196`（A，OpenCommandPaletteDialog）；`apps/web/src/components/CommandPaletteContent.tsx:73`（A，CommandPaletteContent）
- 同一文本作为值用途字面量出现 61 次：`apps/desktop/src/preview/AnnotationKeyboard.ts:15`（comparison）；`apps/desktop/src/preview/GuestInput.ts:53`（membership）；`apps/desktop/src/preview/RecordingInput.ts:28`（object-key）；`apps/web/src/browser/ServerBrowserSurface.tsx:674`（comparison）；`apps/web/src/components/BranchPicker.tsx:178`（comparison）；`apps/web/src/components/ChatMarkdown.tsx:1368`（comparison）；`apps/web/src/components/CommandPalette.tsx:2908`（comparison）；`apps/web/src/components/CommandPalette.tsx:2916`（comparison）；`apps/web/src/components/CommandPalette.tsx:2931`（comparison）；`apps/web/src/components/CommandPalette.tsx:2971`（comparison）；…（共 61 处）

### `Host`（B，message，3 处）

- 显示位置（照常转换）：`apps/web/src/components/pullRequest/PullRequestListFilters.tsx:530`（B，PullRequestFiltersMenu）；`apps/web/src/components/settings/ConnectionsSettings.tsx:2859`（A，renderRemoteFields）；`apps/web/src/components/settings/GitHubTokenSettings.tsx:86`（A，GitHubTokenSettings）
- 同一文本作为值用途字面量出现 1 次：`apps/web/src/components/chat/ComposerSurface.tsx:100`（object-key）

### `Nightly`（A，message，3 处）

- 显示位置（照常转换）：`apps/web/src/components/settings/SettingsPanels.tsx:467`（A，AboutVersionSection）；`apps/web/src/components/settings/SettingsPanels.tsx:475`（A，AboutVersionSection）；`apps/web/src/components/settings/SettingsPanels.tsx:503`（A，AboutVersionSection）
- 同一文本作为值用途字面量出现 3 次：`apps/web/src/components/SidebarStageBackdrop.tsx:9`（ts-type）；`packages/contracts/src/ipc.ts:81`（ts-type）；`packages/contracts/src/ipc.ts:96`（schema-literal）

### `Process`（A，message，3 处）

- 显示位置（照常转换）：`apps/web/src/components/settings/DiagnosticsSettings.tsx:596`（A，ProcessResourceHistoryTable）；`apps/web/src/components/settings/ResourceTelemetryDiagnostics.tsx:581`（A，ProcessTable）；`apps/web/src/components/settings/ResourceTelemetryDiagnostics.tsx:685`（A，HistoryProcessTable）
- 同一文本作为值用途字面量出现 3 次：`apps/desktop/src/preview/RecordingInput.ts:20`（membership）；`apps/web/src/browser/ServerBrowserSurface.tsx:655`（comparison）；`apps/web/src/terminal/ghostty/surface.ts:380`（comparison）

### `Settled`（B，message，3 处）

- 显示位置（照常转换）：`apps/web/src/components/ChatView.tsx:5504`（B，ChatView）；`apps/web/src/components/Sidebar.tsx:5024`（B，Sidebar）；`apps/web/src/components/Sidebar.tsx:5041`（B，Sidebar）
- 同一文本作为值用途字面量出现 1 次：`apps/web/src/hooks/showThreadUndoNotice.ts:12`（ts-type）

### `value`（B，message，3 处）

- 显示位置（照常转换）：`apps/web/src/components/settings/CustomModelEditor.tsx:143`（B，renderChoice）；`apps/web/src/components/settings/ProviderInstanceCard.tsx:421`（B，ProviderEnvironmentSection）；`apps/web/src/components/settings/ProviderInstanceCard.tsx:434`（B，ProviderEnvironmentSection）
- 同一文本作为值用途字面量出现 917 次：`apps/desktop/src/app/DesktopObservability.ts:105`（object-key）；`apps/desktop/src/app/DesktopObservability.ts:241`（object-key）；`apps/desktop/src/app/DesktopObservability.ts:247`（object-key）；`apps/desktop/src/app/chromiumLocalStorage.ts:263`（object-key）；`apps/desktop/src/app/chromiumLocalStorage.ts:285`（object-key）；`apps/desktop/src/app/chromiumLocalStorage.ts:287`（object-key）；`apps/desktop/src/app/chromiumLocalStorage.ts:344`（object-key）；`apps/desktop/src/preview/BrowserImport/BrowserImport.ts:118`（object-key）；`apps/desktop/src/preview/BrowserImport/ChromiumCookies.ts:57`（object-key）；`apps/desktop/src/preview/BrowserImport/ChromiumCookies.ts:73`（object-key）；…（共 917 处）

### `Active`（B，message，2 处）

- 显示位置（照常转换）：`apps/web/src/components/Sidebar.tsx:4954`（B，Sidebar）；`apps/web/src/components/Sidebar.tsx:4965`（B，Sidebar）
- 同一文本作为值用途字面量出现 5 次：`apps/desktop/src/backend/DesktopBackendPool.ts:80`（ts-type）；`apps/desktop/src/backend/DesktopBackendPool.ts:210`（comparison）；`apps/desktop/src/backend/DesktopBackendPool.ts:311`（comparison）；`apps/desktop/src/backend/DesktopBackendPool.ts:317`（comparison）；`apps/web/src/components/settings/ResourceTelemetryDiagnostics.tsx:1124`（never-attribute）

### `Android`（A，message，2 处）

- 显示位置（照常转换）：`apps/web/src/components/RightPanelTabs.tsx:1495`（A，DeviceTabTooltip）；`apps/web/src/components/device/DeviceHostAvailability.tsx:16`（A，DeviceHostAvailability）
- 同一文本作为值用途字面量出现 2 次：`apps/server/src/ws.ts:667`（comparison）；`packages/contracts/src/baseSchemas.ts:295`（schema-literal）

### `Backspace`（A，message，2 处）

- 显示位置（照常转换）：`apps/web/src/components/CommandPaletteContent.tsx:79`（A，CommandPaletteContent）；`apps/web/src/components/projectScriptEditor.tsx:485`（A，ProjectScriptEditorForm）
- 同一文本作为值用途字面量出现 13 次：`apps/desktop/src/preview/GuestInput.ts:51`（membership）；`apps/desktop/src/preview/RecordingInput.ts:30`（object-key）；`apps/web/src/browser/ServerBrowserSurface.tsx:62`（as-const）；`apps/web/src/browser/ServerBrowserSurface.tsx:62`（as-const）；`apps/web/src/browser/ServerBrowserSurface.tsx:690`（comparison）；`apps/web/src/components/CommandPalette.tsx:2944`（comparison）；`apps/web/src/components/chat/ComposerStashMenu.tsx:112`（comparison）；`apps/web/src/components/projectScriptEditor.tsx:319`（comparison）；`apps/web/src/composer-rich-text-doc.ts:215`（object-key）；`apps/web/src/composer-rich-text-doc.ts:282`（object-key）；…（共 13 处）

### `Connect`（A，message，2 处）

- 显示位置（照常转换）：`apps/web/src/components/settings/CodexSetupSection.tsx:667`（A，ManagedCodexSetup）；`apps/web/src/components/settings/ProviderAuthenticationSection.tsx:420`（A，ProviderAuthenticationSection）
- 同一文本作为值用途字面量出现 1 次：`apps/web/src/components/onboarding/WelcomeWizard.tsx:107`（as-const）

### `Custom`（A，message，2 处）

- 显示位置（照常转换）：`apps/web/src/components/settings/StorageSettings.tsx:540`（A，StorageSettingsPanel）；`apps/web/src/components/settings/StorageSettings.tsx:546`（A，StorageSettingsPanel）
- 同一文本作为值用途字面量出现 2 次：`apps/web/src/components/settings/KeybindingsSettings.logic.ts:44`（ts-type）；`apps/web/src/components/settings/KeybindingsSettings.tsx:893`（comparison）

### `Devices`（B，message，2 处）

- 显示位置（照常转换）：`apps/web/src/components/settings/IntegrationsSettings.tsx:812`（B，DeviceIntegrationSettings）；`apps/web/src/components/settings/ProviderSettingsPanel.tsx:380`（B，ProviderSettingsPanelContent）
- 同一文本作为值用途字面量出现 1 次：`apps/web/src/components/device/DevicePanel.tsx:232`（never-attribute）

### `Disabled`（A，message，2 处）

- 显示位置（照常转换）：`apps/web/src/components/onboarding/WelcomeWizard.tsx:990`（A，AgentCard）；`apps/web/src/components/settings/AcpSessionManagementSection.tsx:523`（A，AcpSessionManagementSection）
- 同一文本作为值用途字面量出现 1 次：`apps/web/src/components/settings/ResourceTelemetryDiagnostics.tsx:1117`（never-attribute）

### `Failed`（A，message，2 处）

- 显示位置（照常转换）：`apps/web/src/components/chat/ThreadLineageWorkflowRow.tsx:204`（A，ThreadLineageWorkflowRow）；`apps/web/src/components/settings/DeviceHostEditor.tsx:250`（A，DeviceHostEditorForm）
- 同一文本作为值用途字面量出现 19 次：`apps/desktop/src/backend/DesktopBackendConfiguration.ts:274`（ts-type）；`apps/desktop/src/backend/DesktopBackendConfiguration.ts:315`（as-const）；`apps/desktop/src/backend/DesktopBackendConfiguration.ts:327`（as-const）；`apps/desktop/src/backend/DesktopBackendConfiguration.ts:341`（as-const）；`apps/desktop/src/backend/DesktopBackendConfiguration.ts:357`（as-const）；`apps/desktop/src/backend/DesktopBackendConfiguration.ts:392`（as-const）；`apps/desktop/src/backend/DesktopBackendConfiguration.ts:432`（as-const）；`apps/desktop/src/backend/DesktopBackendConfiguration.ts:705`（comparison）；`apps/web/src/components/Sidebar.logic.ts:596`（ts-type）；`apps/web/src/components/Sidebar.logic.ts:609`（object-key）；…（共 19 处）

### `Files`（A，message，2 处）

- 显示位置（照常转换）：`apps/web/src/components/GitActionsControl.tsx:1892`（A，GitActionsControl）；`apps/web/src/components/diffs/DiffFileTree.tsx:186`（A，DiffFileTree）
- 同一文本作为值用途字面量出现 1 次：`apps/web/src/components/chat/workspaceFileDrop.ts:26`（membership）

### `Local ACP command`（A，message，2 处）

- 显示位置（照常转换）：`apps/web/src/components/settings/AcpRegistrySearchStep.tsx:186`（A，AcpRegistrySearchStep）；`apps/web/src/components/settings/AddProviderInstanceDialog.tsx:463`（A，AddProviderInstanceDialog）
- 同一文本作为值用途字面量出现 1 次：`apps/web/src/components/settings/AddProviderInstanceDialog.tsx:180`（as-const）

### `New thread`（A，message，2 处）

- 显示位置（照常转换）：`apps/web/src/components/LegacySidebar.tsx:2356`（A，SidebarProjectItem）；`apps/web/src/components/sidebar/SidebarThreadHeader.tsx:116`（B，SidebarThreadHeader）
- 同一文本作为值用途字面量出现 1 次：`apps/server/src/orchestration-v2/ThreadTitleRegenerationService.ts:121`（comparison）

### `Provider`（A，message，2 处）

- 显示位置（照常转换）：`apps/web/src/components/GitActionsControl.tsx:633`（A，PublishRepositoryDialog）；`apps/web/src/components/settings/AddProviderInstanceDialog.tsx:404`（A，AddProviderInstanceDialog）
- 同一文本作为值用途字面量出现 4 次：`apps/web/src/components/GitActionsControl.tsx:540`（as-const）；`apps/web/src/components/settings/AddProviderInstanceDialog.logic.ts:8`（as-const）；`apps/web/src/components/settings/AddProviderInstanceDialog.logic.ts:9`（as-const）；`apps/web/src/components/settings/AddProviderInstanceDialog.logic.ts:10`（as-const）

### `Read`（B，message，2 处）

- 显示位置（照常转换）：`apps/web/src/components/settings/ResourceTelemetryDiagnostics.tsx:282`（B，AggregateCard）；`apps/web/src/components/settings/ResourceTelemetryDiagnostics.tsx:690`（A，HistoryProcessTable）
- 同一文本作为值用途字面量出现 1 次：`apps/server/src/orchestration-v2/Adapters/ClaudeAdapterV2.ts:437`（as-const）

### `Repository`（A，message，2 处）

- 显示位置（照常转换）：`apps/web/src/components/CommandPalette.tsx:3309`（A，OpenCommandPaletteDialog）；`apps/web/src/components/GitActionsControl.tsx:710`（A，PublishRepositoryDialog）
- 同一文本作为值用途字面量出现 6 次：`apps/server/src/project/AgentSessionScanner.ts:694`（ts-type）；`apps/server/src/project/AgentSessionScanner.ts:726`（as-const）；`apps/server/src/project/AgentSessionScanner.ts:1237`（comparison）；`apps/web/src/components/GitActionsControl.tsx:540`（as-const）；`packages/source-control-github/src/server/GitHubPullRequestApi.ts:2405`（comparison）；`packages/source-control-github/src/server/pullRequestReads.graphql.ts:1546`（schema-literal）

### `Skill`（A，message，2 处）

- 显示位置（照常转换）：`apps/web/src/components/chat/ComposerCommandMenu.tsx:273`（A，SkillSourceBadge）；`apps/web/src/components/chat/MessagesTimeline.tsx:4375`（B，userMessageContextPresentationRegistry）
- 同一文本作为值用途字面量出现 1 次：`packages/shared/src/toolActivity.ts:21`（comparison）

### `Snoozed`（B，message，2 处）

- 显示位置（照常转换）：`apps/web/src/components/ChatView.tsx:5495`（B，ChatView）；`apps/web/src/components/Sidebar.tsx:5004`（B，Sidebar）
- 同一文本作为值用途字面量出现 1 次：`apps/web/src/hooks/showThreadUndoNotice.ts:12`（ts-type）

### `Stop`（A，message，2 处）

- 显示位置（照常转换）：`apps/web/src/components/ChatView.tsx:5484`（A，ChatView）；`apps/web/src/components/preview/PreviewChromeRow.tsx:148`（B，PreviewChromeRow）
- 同一文本作为值用途字面量出现 2 次：`packages/effect-codex-app-server/src/_generated/schema.gen.ts:52062`（object-key）；`packages/effect-codex-app-server/src/_generated/schema.gen.ts:52086`（object-key）

### `T3 Code`（A，message，2 处）

- 显示位置（照常转换）：`apps/web/src/components/chat/MessagesTimeline.tsx:2671`（A，AssistantTimelineRow）；`apps/web/src/components/onboarding/WelcomeWizard.tsx:236`（B，WelcomeWizard）
- 同一文本作为值用途字面量出现 1 次：`apps/server/src/cloud/cliAuthHtml.ts:12`（as-const）

### `Version`（B，message，2 处）

- 显示位置（照常转换）：`apps/web/src/components/settings/ConnectionsSettings.tsx:3513`（B，ConnectionsSettings）；`apps/web/src/components/settings/SettingsPanels.tsx:278`（A，AboutVersionTitle）
- 同一文本作为值用途字面量出现 3 次：`apps/desktop/src/snapShot/LinuxSnapShot.ts:55`（object-key）；`apps/desktop/src/snapShot/LinuxSnapShot.ts:56`（object-key）；`apps/desktop/src/snapShot/NiriSnapShot.ts:45`（object-key）

### `Working`（A，message，2 处）

- 显示位置（照常转换）：`apps/web/src/components/CommandPalette.tsx:3153`（A，OpenCommandPaletteDialog）；`apps/web/src/components/Sidebar.tsx:4986`（B，Sidebar）
- 同一文本作为值用途字面量出现 2 次：`apps/web/src/components/Sidebar.logic.ts:593`（ts-type）；`apps/web/src/components/Sidebar.logic.ts:610`（object-key）

### `comment`（A，message，2 处）

- 显示位置（照常转换）：`apps/web/src/components/pullRequest/PullRequestReviewAnnotation.tsx:234`（A，ReviewThreadCard）；`apps/web/src/components/pullRequest/PullRequestTimelineTab.tsx:333`（A，ConversationGroup）
- 同一文本作为值用途字面量出现 121 次：`apps/desktop/src/preview/PickPreload.ts:1418`（object-key）；`apps/desktop/src/preview/PickedElementPayload.ts:64`（computed-key）；`apps/server/src/pullRequest/PullRequestService.ts:240`（object-key）；`apps/server/src/pullRequest/PullRequestService.ts:276`（object-key）；`apps/server/src/pullRequest/PullRequestService.ts:558`（object-key）；`apps/server/src/pullRequest/PullRequestService.ts:1941`（ts-type）；`apps/server/src/pullRequest/PullRequestService.ts:1945`（error-constructor）；`apps/server/src/pullRequest/PullRequestService.ts:1955`（error-constructor）；`apps/server/src/pullRequest/PullRequestService.ts:1965`（error-constructor）；`apps/server/src/pullRequest/PullRequestService.ts:3408`（object-key）；…（共 121 处）

### `comments`（A，message，2 处）

- 显示位置（照常转换）：`apps/web/src/components/pullRequest/PullRequestReviewAnnotation.tsx:234`（A，ReviewThreadCard）；`apps/web/src/components/pullRequest/PullRequestTimelineTab.tsx:333`（A，ConversationGroup）
- 同一文本作为值用途字面量出现 86 次：`apps/server/src/orchestration-v2/PullRequestWatchReactor.ts:253`（object-key）；`apps/server/src/orchestration-v2/PullRequestWatchReactor.ts:335`（object-key）；`apps/server/src/orchestration-v2/PullRequestWatchReactor.ts:364`（object-key）；`apps/server/src/pullRequest/PullRequestService.ts:1666`（object-key）；`apps/server/src/pullRequest/PullRequestService.ts:2095`（object-key）；`apps/web/src/components/chat/ThreadDetailsPrRow.tsx:206`（object-key）；`apps/web/src/components/pullRequest/PullRequestDetailPanel.tsx:534`（object-key）；`apps/web/src/components/pullRequest/PullRequestDetailPanel.tsx:1405`（object-key）；`apps/web/src/components/pullRequest/PullRequestReviewAnnotation.tsx:169`（object-key）；`apps/web/src/components/pullRequest/PullRequestReviewAnnotation.tsx:208`（object-key）；…（共 86 处）

### `default`（A，message，2 处）

- 显示位置（照常转换）：`apps/web/src/components/settings/EnvironmentIconPicker.tsx:85`（A，EnvironmentIconMenu）；`apps/web/src/components/settings/FontFamilyPicker.tsx:160`（A，renderItem）
- 同一文本作为值用途字面量出现 521 次：`apps/desktop/src/ipc/methods/window.ts:160`（comparison）；`apps/desktop/src/snapShot/RegionSnapShotWorker.ts:9`（object-key）；`apps/server/src/device/DeviceActions.ts:93`（object-key）；`apps/server/src/device/DeviceActions.ts:99`（object-key）；`apps/server/src/mcp/OrchestratorMcpService.ts:1080`（as-const）；`apps/server/src/mcp/threadAccess.ts:124`（comparison）；`apps/server/src/orchestration-v2/Adapters/ClaudeAdapterV2.ts:9099`（as-const）；`apps/server/src/orchestration-v2/DispatchModeLimit.ts:35`（object-key）；`apps/server/src/provider/CodexMcpElicitation.ts:37`（object-key）；`apps/server/src/usage/CodexUsageHistory.ts:111`（comparison）；…（共 521 处）

### `file`（A，message，2 处）

- 显示位置（照常转换）：`apps/web/src/components/chat/ThreadDetailsPrRow.tsx:292`（A，ThreadDetailsPrRow）；`apps/web/src/components/pullRequest/PullRequestCodeTab.tsx:1046`（A，PullRequestCodeTab）
- 同一文本作为值用途字面量出现 210 次：`apps/desktop/src/permissions/MacPermissionHelper.ts:140`（object-key）；`apps/server/src/assets/AssetAccess.ts:176`（ts-type）；`apps/server/src/assets/AssetAccess.ts:181`（object-key）；`apps/server/src/assets/AssetAccess.ts:956`（object-key）；`apps/server/src/assets/AttachmentUpload.ts:44`（schema-literal）；`apps/server/src/assets/AttachmentUpload.ts:97`（comparison）；`apps/server/src/assets/AttachmentUpload.ts:163`（comparison）；`apps/server/src/attachmentStore.ts:162`（switch-case）；`apps/server/src/http.ts:170`（object-key）；`apps/server/src/http.ts:503`（object-key）；…（共 210 处）

### `files`（A，message，2 处）

- 显示位置（照常转换）：`apps/web/src/components/chat/ThreadDetailsPrRow.tsx:292`（A，ThreadDetailsPrRow）；`apps/web/src/components/pullRequest/PullRequestCodeTab.tsx:1046`（A，PullRequestCodeTab）
- 同一文本作为值用途字面量出现 241 次：`apps/desktop/src/snapShot/CaptureShortcutConfig.ts:101`（object-key）；`apps/desktop/src/snapShot/CaptureShortcutConfig.ts:220`（object-key）；`apps/desktop/src/snapShot/CaptureShortcutConfig.ts:235`（object-key）；`apps/server/src/git/GitManager.ts:1117`（object-key）；`apps/server/src/git/GitWorkflowService.ts:143`（object-key）；`apps/server/src/orchestration-v2/CheckpointCaptureService.ts:283`（object-key）；`apps/server/src/orchestration-v2/CheckpointService.ts:225`（object-key）；`apps/server/src/orchestration-v2/CheckpointService.ts:225`（ts-type）；`apps/server/src/orchestration-v2/CheckpointService.ts:239`（object-key）；`apps/server/src/orchestration-v2/CheckpointService.ts:347`（object-key）；…（共 241 处）

### `ghost`（A，message，2 处）

- 显示位置（照常转换）：`apps/web/src/components/pullRequest/PullRequestTimelineTab.tsx:94`（A，ActorName）；`apps/web/src/components/pullRequest/PullRequestTimelineTab.tsx:420`（A，ReviewThreadEvent）
- 同一文本作为值用途字面量出现 11 次：`apps/web/src/components/chat/MessageCopyButton.tsx:28`（ts-type）；`apps/web/src/components/chat/MessageCopyButton.tsx:50`（comparison）；`apps/web/src/components/ui/button.tsx:48`（object-key）；`apps/web/src/components/ui/input-group.tsx:26`（object-key）；`apps/web/src/components/ui/menu.tsx:82`（ts-type）；`apps/web/src/components/ui/menu.tsx:88`（comparison）；`apps/web/src/components/ui/menu.tsx:90`（non-display-call）；`apps/web/src/components/ui/select.tsx:24`（object-key）；`apps/web/src/components/ui/toast.tsx:49`（ts-type）；`apps/web/src/components/ui/toast.tsx:61`（ts-type）；…（共 11 处）

### `iOS`（A，message，2 处）

- 显示位置（照常转换）：`apps/web/src/components/RightPanelTabs.tsx:1495`（A，DeviceTabTooltip）；`apps/web/src/components/device/DeviceHostAvailability.tsx:16`（A，DeviceHostAvailability）
- 同一文本作为值用途字面量出现 2 次：`apps/server/src/ws.ts:667`（comparison）；`packages/contracts/src/baseSchemas.ts:294`（schema-literal）

### `on`（A，message，2 处）

- 显示位置（照常转换）：`apps/web/src/components/settings/ScheduledTasksSettings.tsx:1700`（A，ScheduledTaskEditorForm）；`apps/web/src/components/settings/SettingsScopeSentence.tsx:79`（A，SettingsScopeSentence）
- 同一文本作为值用途字面量出现 26 次：`apps/desktop/src/app/DesktopLifecycle.ts:69`（object-key）；`apps/desktop/src/electron/ElectronApp.ts:80`（object-key）；`apps/desktop/src/electron/ElectronApp.ts:210`（object-key）；`apps/desktop/src/electron/ElectronUpdater.ts:76`（object-key）；`apps/desktop/src/electron/ElectronUpdater.ts:154`（object-key）；`apps/desktop/src/electron/ElectronUpdater.ts:156`（object-key）；`apps/desktop/src/ipc/DesktopIpc.ts:26`（object-key）；`apps/desktop/src/snapShot/snapShot.ts:133`（ts-type）；`apps/desktop/src/snapShot/snapShot.ts:233`（comparison）；`apps/desktop/src/updates/updatesTestHarness.ts:98`（object-key）；…（共 26 处）

### `opened`（A，message，2 处）

- 显示位置（照常转换）：`apps/web/src/components/pullRequest/PullRequestLinkPreview.tsx:142`（A，PullRequestLinkPreview）；`apps/web/src/components/settings/ScheduledTasksSettings.tsx:243`（B，WebhookFiltersField）
- 同一文本作为值用途字面量出现 14 次：`apps/server/src/preview/ServerBrowser.ts:2060`（comparison）；`apps/web/src/components/device/DeviceAndroidFoldControls.tsx:135`（comparison）；`apps/web/src/components/device/DeviceAndroidFoldControls.tsx:137`（comparison）；`apps/web/src/components/device/deviceFold.ts:4`（ts-type）；`apps/web/src/components/device/deviceFold.ts:8`（ts-type）；`apps/web/src/components/device/deviceFold.ts:34`（comparison）；`apps/web/src/components/promptLinks/NewThreadLinkView.tsx:46`（ts-type）；`apps/web/src/components/promptLinks/NewThreadLinkView.tsx:279`（switch-case）；`apps/web/src/components/pullRequest/PullRequestTimelineTab.tsx:514`（comparison）；`apps/web/src/components/pullRequest/pullRequestDetail.logic.ts:476`（ts-type）；…（共 14 处）

### `replies`（A，message，2 处）

- 显示位置（照常转换）：`apps/web/src/components/pullRequest/PullRequestSummaryTab.tsx:238`（A，CollapsedComment）；`apps/web/src/components/pullRequest/PullRequestTimelineTab.tsx:424`（A，ReviewThreadEvent）
- 同一文本作为值用途字面量出现 6 次：`apps/web/src/components/pullRequest/PullRequestSummaryTab.tsx:214`（object-key）；`apps/web/src/components/pullRequest/PullRequestSummaryTab.tsx:225`（object-key）；`apps/web/src/components/pullRequest/pullRequestDetail.logic.ts:502`（object-key）；`apps/web/src/components/pullRequest/pullRequestDetail.logic.ts:574`（object-key）；`apps/web/src/components/pullRequest/pullRequestDetail.logic.ts:608`（object-key）；`apps/web/src/components/pullRequest/pullRequestDetail.logic.ts:725`（object-key）

### `reply`（A，message，2 处）

- 显示位置（照常转换）：`apps/web/src/components/pullRequest/PullRequestSummaryTab.tsx:238`（A，CollapsedComment）；`apps/web/src/components/pullRequest/PullRequestTimelineTab.tsx:424`（A，ReviewThreadEvent）
- 同一文本作为值用途字面量出现 16 次：`apps/server/src/htmlRender/headlessChrome.ts:248`（object-key）；`apps/server/src/htmlRender/headlessChrome.ts:355`（object-key）；`apps/server/src/htmlRender/headlessChrome.ts:393`（object-key）；`apps/web/src/components/pullRequest/PullRequestCodeTab.tsx:462`（object-key）；`apps/web/src/components/pullRequest/PullRequestSummaryTab.tsx:560`（object-key）；`apps/web/src/components/pullRequest/PullRequestSummaryTab.tsx:560`（object-key）；`apps/web/src/components/pullRequest/PullRequestSummaryTab.tsx:629`（object-key）；`packages/contracts/src/pullRequest.ts:243`（object-key）；`packages/provider-opencode/src/server/adapter.ts:3501`（object-key）；`packages/provider-opencode/src/server/adapter.ts:3506`（object-key）；…（共 16 处）

### `updated`（A，message，2 处）

- 显示位置（照常转换）：`apps/web/src/components/pullRequest/PullRequestDetailPanel.tsx:2538`（A，PullRequestDetailPanel）；`apps/web/src/components/pullRequest/PullRequestGhosts.tsx:207`（A，PullRequestDetailGhost）
- 同一文本作为值用途字面量出现 32 次：`apps/server/src/cli/update.ts:512`（error-constructor）；`apps/server/src/textGeneration/OpenCode2TextGeneration.fixture.ts:43`（object-key）；`apps/server/src/textGeneration/OpenCode2TextGeneration.fixture.ts:89`（object-key）；`apps/web/src/components/ProviderUpdateLaunchNotification.logic.ts:371`（ts-type）；`apps/web/src/components/ServerUpdateAction.tsx:66`（ts-type）；`apps/web/src/components/chat/V2LifecycleRow.tsx:338`（object-key）；`apps/web/src/components/chat/V2LifecycleRow.tsx:346`（object-key）；`apps/web/src/components/pullRequest/PullRequestDetailLayout.tsx:12`（object-key）；`apps/web/src/components/pullRequest/PullRequestDetailLayout.tsx:21`（object-key）；`apps/web/src/components/pullRequest/pullRequestList.logic.ts:791`（comparison）；…（共 32 处）

### `Add ChatGPT account`（B，message，1 处）

- 显示位置（照常转换）：`apps/web/src/components/settings/AddCodexAccountDialog.tsx:93`（B，AddCodexAccountDialog）
- 同一文本作为值用途字面量出现 1 次：`apps/web/src/components/settings/AddCodexAccountDialog.tsx:39`（non-display-call）

### `Alt`（A，message，1 处）

- 显示位置（照常转换）：`apps/web/src/components/settings/KeybindingsSettings.tsx:100`（A，KeybindingPill）
- 同一文本作为值用途字面量出现 7 次：`apps/desktop/src/preview/GuestInput.ts:63`（membership）；`apps/desktop/src/preview/RecordingInput.ts:23`（comparison）；`apps/desktop/src/preview/RecordingInput.ts:40`（membership）；`apps/web/src/components/ComposerPromptEditorTiptap.tsx:1827`（comparison）；`apps/web/src/components/settings/useSnapShotShortcutRecorder.tsx:23`（object-key）；`apps/web/src/shortcutModifierState.ts:84`（switch-case）；`packages/contracts/src/previewAutomation.ts:563`（schema-literal）

### `Any`（A，message，1 处）

- 显示位置（照常转换）：`apps/web/src/components/pullRequest/PullRequestListFilters.tsx:334`（A，PullRequestLabelFilter）
- 同一文本作为值用途字面量出现 1 次：`apps/server/src/project/AgentSessionJson.ts:32`（switch-case）

### `App`（B，message，1 处）

- 显示位置（照常转换）：`apps/web/src/components/device/DeviceToolsPanel.tsx:128`（B，DeviceToolsPanel）
- 同一文本作为值用途字面量出现 6 次：`apps/desktop/src/electron/WindowsForegroundFocusWorker.ts:29`（ts-type）；`apps/desktop/src/electron/WindowsForegroundFocusWorker.ts:47`（ts-type）；`apps/desktop/src/electron/WindowsForegroundFocusWorker.ts:60`（ts-type）；`apps/desktop/src/electron/WindowsForegroundFocusWorker.ts:79`（object-key）；`apps/desktop/src/snapShot/SnapShotAccessibility.ts:39`（ts-type）；`apps/desktop/src/snapShot/SnapShotAccessibilityWorker.ts:9`（object-key）

### `Attachment`（A，message，1 处）

- 显示位置（照常转换）：`apps/web/src/components/files/AttachmentFilePreview.tsx:268`（A，AttachmentFilePreview）
- 同一文本作为值用途字面量出现 1 次：`apps/web/src/components/chat/ComposerBanner.tsx:339`（object-key）

### `Body`（B，message，1 处）

- 显示位置（照常转换）：`apps/web/src/components/settings/ScheduledTasksSettings.tsx:892`（B，WebhookDeliveriesDialog）
- 同一文本作为值用途字面量出现 1 次：`apps/web/src/components/chat/ComposerBanner.tsx:351`（object-key）

### `Browser`（B，message，1 处）

- 显示位置（照常转换）：`apps/web/src/components/settings/IntegrationsSettings.tsx:1631`（B，IntegrationsSettingsPanel）
- 同一文本作为值用途字面量出现 6 次：`apps/server/src/provider/CodexToolPresentation.ts:190`（comparison）；`apps/server/src/resourceTelemetry/Model.ts:105`（switch-case）；`apps/web/src/components/RightPanelTabs.tsx:489`（comparison）；`apps/web/src/components/RightPanelTabs.tsx:496`（comparison）；`apps/web/src/components/RightPanelTabs.tsx:1342`（comparison）；`packages/contracts/src/resourceTelemetry.ts:231`（schema-literal）

### `Coalesce key`（B，message，1 处）

- 显示位置（照常转换）：`apps/web/src/components/settings/ScheduledTasksSettings.tsx:1564`（B，ScheduledTaskEditorForm）
- 同一文本作为值用途字面量出现 1 次：`apps/web/src/components/settings/scheduledTasksSettings.logic.ts:114`（as-const）

### `Commit`（A，message，1 处）

- 显示位置（照常转换）：`apps/web/src/components/GitActionsControl.tsx:2021`（A，GitActionsControl）
- 同一文本作为值用途字面量出现 1 次：`apps/web/src/components/GitActionsControl.tsx:320`（comparison）

### `Copy`（A，message，1 处）

- 显示位置（照常转换）：`apps/web/src/components/settings/ScheduledTasksSettings.tsx:1027`（A，WebhookEndpointField）
- 同一文本作为值用途字面量出现 1 次：`apps/web/src/terminal/ghostty/keyCodes.ts:180`（as-const）

### `Count`（A，message，1 处）

- 显示位置（照常转换）：`apps/web/src/components/settings/ResourceTelemetryDiagnostics.tsx:771`（A，AttributionTable）
- 同一文本作为值用途字面量出现 1 次：`apps/web/src/components/chat/ComposerBanner.tsx:350`（object-key）

### `Cursor`（A，message，1 处）

- 显示位置（照常转换）：`apps/web/src/components/usage/UsagePage.tsx:1190`（A，CursorEnableLimits）
- 同一文本作为值用途字面量出现 2 次：`packages/provider-cursor/src/server/sdk.ts:12`（object-key）；`packages/provider-cursor/src/server/status.ts:27`（as-const）

### `Desktop`（B，message，1 处）

- 显示位置（照常转换）：`apps/web/src/components/settings/ResourceTelemetryDiagnostics.tsx:1070`（B，ResourceTelemetryDiagnostics）
- 同一文本作为值用途字面量出现 1 次：`packages/shared/src/previewViewport.ts:11`（ts-type）

### `Device hub`（B，message，1 处）

- 显示位置（照常转换）：`apps/web/src/components/settings/IntegrationsSettings.tsx:975`（B，DeviceIntegrationControls）
- 同一文本作为值用途字面量出现 2 次：`apps/web/src/components/device/DeviceToolVersions.tsx:54`（as-const）；`packages/client-runtime/src/state/device.ts:100`（as-const）

### `Enabled`（A，message，1 处）

- 显示位置（照常转换）：`apps/web/src/components/settings/ScheduledTasksSettings.tsx:1745`（A，ScheduledTaskEditorForm）
- 同一文本作为值用途字面量出现 1 次：`apps/web/src/components/settings/ResourceTelemetryDiagnostics.tsx:1116`（never-attribute）

### `Encoding`（B，message，1 处）

- 显示位置（照常转换）：`apps/web/src/components/settings/ScheduledTasksSettings.tsx:1645`（B，ScheduledTaskEditorForm）
- 同一文本作为值用途字面量出现 8 次：`apps/server/src/persistence/Errors.ts:8`（switch-case）；`packages/effect-acp/src/errors.ts:22`（schema-literal）；`packages/effect-acp/src/errors.ts:81`（switch-case）；`packages/effect-acp/src/errors.ts:116`（switch-case）；`packages/effect-codex-app-server/src/errors.ts:14`（schema-literal）；`packages/effect-codex-app-server/src/errors.ts:44`（switch-case）；`packages/shared/src/schemaJson.ts:57`（switch-case）；`packages/shared/src/schemaJson.ts:78`（switch-case）

### `Environment disconnected`（B，message，1 处）

- 显示位置（照常转换）：`apps/web/src/components/settings/ScheduledTasksSettings.tsx:631`（B，ScheduledTaskEnvironmentSection）
- 同一文本作为值用途字面量出现 3 次：`apps/web/src/components/settings/DeviceHostsSettings.tsx:73`（error-constructor）；`apps/web/src/components/settings/IntegrationsSettings.tsx:869`（error-constructor）；`apps/web/src/components/settings/deviceHostConnectionChecks.ts:48`（error-constructor）

### `Filter`（A，message，1 处）

- 显示位置（照常转换）：`apps/web/src/components/pullRequest/PullRequestSummaryTab.tsx:862`（A，PullRequestSummaryTab）
- 同一文本作为值用途字面量出现 8 次：`apps/server/src/persistence/Errors.ts:7`（switch-case）；`packages/effect-acp/src/errors.ts:21`（schema-literal）；`packages/effect-acp/src/errors.ts:80`（switch-case）；`packages/effect-acp/src/errors.ts:115`（switch-case）；`packages/effect-codex-app-server/src/errors.ts:13`（schema-literal）；`packages/effect-codex-app-server/src/errors.ts:43`（switch-case）；`packages/shared/src/schemaJson.ts:55`（switch-case）；`packages/shared/src/schemaJson.ts:80`（switch-case）

### `HEAD`（A，message，1 处）

- 显示位置（照常转换）：`apps/web/src/components/DiffPanel.tsx:728`（A，DiffPanel）
- 同一文本作为值用途字面量出现 19 次：`apps/desktop/src/electron/ElectronProtocol.ts:200`（comparison）；`apps/desktop/src/electron/ElectronProtocol.ts:205`（comparison）；`apps/desktop/src/electron/ElectronProtocol.ts:219`（comparison）；`apps/desktop/src/electron/ElectronProtocol.ts:242`（comparison）；`apps/server/src/device/DeviceHubProxy.ts:129`（comparison）；`apps/server/src/device/DeviceHubProxy.ts:177`（comparison）；`apps/server/src/http.ts:175`（ts-type）；`apps/server/src/http.ts:191`（comparison）；`apps/server/src/http.ts:239`（comparison）；`apps/server/src/http.ts:452`（comparison）；…（共 19 处）

### `Home`（B，message，1 处）

- 显示位置（照常转换）：`apps/web/src/components/device/DeviceControlsRail.tsx:64`（B，DeviceControlsRail）
- 同一文本作为值用途字面量出现 16 次：`apps/desktop/src/preview/GuestInput.ts:57`（membership）；`apps/web/src/components/ChatView.tsx:4430`（membership）；`apps/web/src/components/ChatView.tsx:4432`（membership）；`apps/web/src/components/ChatView.tsx:4440`（switch-case）；`apps/web/src/components/ComposerPromptEditorTiptap.tsx:1155`（comparison）；`apps/web/src/components/ComposerPromptEditorTiptap.tsx:1174`（comparison）；`apps/web/src/components/chat/MessagesTimeline.tsx:921`（membership）；`apps/web/src/components/chat/MessagesTimeline.tsx:1801`（comparison）；`apps/web/src/components/chat/composerScrollGesture.ts:16`（switch-case）；`apps/web/src/components/chat/useAssistantCitationTarget.ts:166`（membership）；…（共 16 处）

### `Icon`（A，message，1 处）

- 显示位置（照常转换）：`apps/web/src/components/settings/EnvironmentIconPicker.tsx:58`（A，EnvironmentIconMenu）
- 同一文本作为值用途字面量出现 113 次：`apps/web/src/components/ChatMarkdown.tsx:443`（object-key）；`apps/web/src/components/ChatMarkdown.tsx:447`（object-key）；`apps/web/src/components/ChatMarkdown.tsx:453`（object-key）；`apps/web/src/components/ChatMarkdown.tsx:459`（object-key）；`apps/web/src/components/ChatMarkdown.tsx:465`（object-key）；`apps/web/src/components/ChatMarkdown.tsx:471`（object-key）；`apps/web/src/components/GitActionsControl.tsx:187`（object-key）；`apps/web/src/components/GitActionsControl.tsx:295`（ts-type）；`apps/web/src/components/GitActionsControl.tsx:309`（ts-type）；`apps/web/src/components/GitActionsControl.tsx:758`（object-key）；…（共 113 处）

### `Idle`（B，message，1 处）

- 显示位置（照常转换）：`apps/web/src/components/settings/ResourceTelemetryDiagnostics.tsx:1121`（B，ResourceTelemetryDiagnostics）
- 同一文本作为值用途字面量出现 25 次：`apps/desktop/src/preview/Manager.ts:89`（ts-type）；`apps/desktop/src/preview/Manager.ts:1307`（comparison）；`apps/desktop/src/preview/Manager.ts:2012`（comparison）；`apps/server/src/preview/Manager.ts:240`（comparison）；`apps/web/src/browser/ElectronBrowserHost.tsx:122`（comparison）；`apps/web/src/components/RightPanelTabs.tsx:574`（comparison）；`apps/web/src/components/RightPanelTabs.tsx:611`（comparison）；`apps/web/src/components/preview/PreviewView.tsx:226`（as-const）；`apps/web/src/components/preview/PreviewView.tsx:227`（comparison）；`apps/web/src/components/preview/PreviewView.tsx:231`（comparison）；…（共 25 处）

### `Interrupt`（A，message，1 处）

- 显示位置（照常转换）：`apps/web/src/components/chat/ComposerPrimaryActions.tsx:154`（A，renderStopGenerationButton）
- 同一文本作为值用途字面量出现 5 次：`packages/effect-acp/src/protocol.ts:281`（comparison）；`packages/effect-acp/src/protocol.ts:694`（switch-case）；`packages/effect-codex-app-server/src/_generated/schema.gen.ts:52054`（object-key）；`packages/effect-codex-app-server/src/_generated/schema.gen.ts:52070`（object-key）；`packages/shared/src/schemaJson.ts:139`（switch-case）

### `J`（A，message，1 处）

- 显示位置（照常转换）：`apps/web/src/components/pullRequest/guide/GuideStop.tsx:123`（A，GuideStop）
- 同一文本作为值用途字面量出现 1 次：`packages/shared/src/terminalOutput.ts:464`（switch-case）

### `K`（A，message，1 处）

- 显示位置（照常转换）：`apps/web/src/components/pullRequest/guide/GuideStop.tsx:124`（A，GuideStop）
- 同一文本作为值用途字面量出现 1 次：`packages/shared/src/terminalOutput.ts:461`（switch-case）

### `Mode`（A，message，1 处）

- 显示位置（照常转换）：`apps/web/src/components/chat/CompactComposerControlsMenu.tsx:64`（A，CompactComposerControlsMenu）
- 同一文本作为值用途字面量出现 1 次：`packages/shared/src/qrCode.ts:574`（object-key）

### `Organization`（B，message，1 处）

- 显示位置（照常转换）：`apps/web/src/components/settings/SettingsPanels.tsx:2169`（B，GeneralSettingsPanel）
- 同一文本作为值用途字面量出现 1 次：`packages/source-control-github/src/server/pullRequestReviews.graphql.ts:24`（schema-literal）

### `Path`（A，message，1 处）

- 显示位置（照常转换）：`apps/web/src/components/chat/WorktreeSetupCard.tsx:259`（A，SetupDetails）
- 同一文本作为值用途字面量出现 4 次：`apps/server/src/cli/update.ts:179`（computed-key）；`apps/server/src/cloud/pinnedRuntime.ts:414`（computed-key）；`apps/server/src/process/externalLauncher.ts:122`（object-key）；`packages/provider-core/src/server/maintenanceResolver.ts:56`（object-key）

### `Projects`（A，message，1 处）

- 显示位置（照常转换）：`apps/web/src/components/LegacySidebar.tsx:2899`（A，SidebarProjectsContent）
- 同一文本作为值用途字面量出现 1 次：`apps/web/src/components/onboarding/WelcomeWizard.tsx:107`（as-const）

### `Remove route`（A，message，1 处）

- 显示位置（照常转换）：`apps/web/src/components/settings/EnvironmentRoutesList.tsx:205`（A，SortableRouteRow）
- 同一文本作为值用途字面量出现 1 次：`apps/web/src/components/settings/EnvironmentRoutesList.tsx:64`（non-display-call）

### `Replay key`（B，message，1 处）

- 显示位置（照常转换）：`apps/web/src/components/settings/ScheduledTasksSettings.tsx:1550`（B，ScheduledTaskEditorForm）
- 同一文本作为值用途字面量出现 1 次：`apps/web/src/components/settings/scheduledTasksSettings.logic.ts:113`（as-const）

### `Running`（A，message，1 处）

- 显示位置（照常转换）：`apps/web/src/components/device/DeviceToolVersions.tsx:63`（A，DeviceToolVersions）
- 同一文本作为值用途字面量出现 4 次：`apps/server/src/pullRequest/PullRequestReviewGuideService.ts:484`（comparison）；`apps/web/src/components/pullRequest/guide/PullRequestGuideRunCoordinator.tsx:46`（comparison）；`apps/web/src/components/pullRequest/guide/useReviewGuideWriter.ts:34`（comparison）；`apps/web/src/components/pullRequest/guide/useReviewGuideWriter.ts:47`（comparison）

### `Skipped`（A，message，1 处）

- 显示位置（照常转换）：`apps/web/src/components/settings/BrowserImportWizard.tsx:541`（A，DoneStep）
- 同一文本作为值用途字面量出现 2 次：`apps/server/src/project/AgentSessionImporter.ts:221`（comparison）；`apps/server/src/project/AgentSessionScanner.ts:153`（ts-type）

### `Span`（A，message，1 处）

- 显示位置（照常转换）：`apps/web/src/components/settings/DiagnosticsSettings.tsx:1271`（A，DiagnosticsSettingsPanel）
- 同一文本作为值用途字面量出现 1 次：`packages/shared/src/nodeSqliteClient.ts:75`（comparison）

### `This connection cannot read host files.`（A，message，1 处）

- 显示位置（照常转换）：`apps/web/src/components/files/FilePreviewPanel.tsx:1209`（A，FilePreviewPanel）
- 同一文本作为值用途字面量出现 1 次：`apps/web/src/components/media/MediaActions.tsx:73`（error-constructor）

### `Type`（A，message，1 处）

- 显示位置（照常转换）：`apps/web/src/components/settings/DiagnosticsSettings.tsx:375`（A，ProcessDiagnosticsTable）
- 同一文本作为值用途字面量出现 23 次：`apps/server/src/textGeneration/ClaudeTextGeneration.ts:137`（ts-type）；`apps/server/src/textGeneration/CodexTextGeneration.ts:231`（ts-type）；`packages/contracts/src/baseSchemas.ts:132`（ts-type）；`packages/contracts/src/baseSchemas.ts:133`（ts-type）；`packages/contracts/src/baseSchemas.ts:141`（ts-type）；`packages/contracts/src/baseSchemas.ts:194`（ts-type）；`packages/contracts/src/baseSchemas.ts:227`（ts-type）；`packages/contracts/src/baseSchemas.ts:228`（ts-type）；`packages/contracts/src/baseSchemas.ts:232`（ts-type）；`packages/contracts/src/orchestrationV2.ts:795`（ts-type）；…（共 23 处）

### `Unknown`（A，message，1 处）

- 显示位置（照常转换）：`apps/web/src/components/device/DeviceToolsPanel.tsx:388`（A，ChoiceSelect）
- 同一文本作为值用途字面量出现 6 次：`apps/server/src/project/AgentSessionJson.ts:31`（switch-case）；`apps/server/src/provider/AntigravityInstallation.ts:367`（comparison）；`apps/server/src/provider/Drivers/CodexHomeLayout.ts:150`（comparison）；`apps/web/src/components/settings/ResourceTelemetryDiagnostics.tsx:1050`（never-attribute）；`packages/contracts/src/resourceTelemetry.ts:239`（schema-literal）；`packages/shared/src/symlink.ts:42`（error-constructor）

### `Worktree`（A，message，1 处）

- 显示位置（照常转换）：`apps/web/src/components/PullRequestThreadDialog.tsx:312`（A，PullRequestThreadDialog）
- 同一文本作为值用途字面量出现 4 次：`apps/server/src/project/AgentSessionScanner.ts:695`（ts-type）；`apps/server/src/project/AgentSessionScanner.ts:716`（as-const）；`apps/server/src/project/AgentSessionScanner.ts:723`（as-const）；`apps/server/src/project/AgentSessionScanner.ts:1233`（comparison）

### `agent`（A，message，1 处）

- 显示位置（照常转换）：`apps/web/src/components/chat/ThreadLineageWorkflowRow.tsx:208`（A，ThreadLineageWorkflowRow）
- 同一文本作为值用途字面量出现 175 次：`apps/desktop/src/preview/Manager.ts:111`（ts-type）；`apps/desktop/src/preview/PickPreload.ts:64`（comparison）；`apps/desktop/src/preview/PickPreload.ts:84`（comparison）；`apps/desktop/src/preview/RecordingCursor.ts:43`（ts-type）；`apps/desktop/src/preview/RecordingCursor.ts:58`（comparison）；`apps/desktop/src/preview/RecordingCursor.ts:127`（comparison）；`apps/server/src/cli/triage.ts:45`（object-key）；`apps/server/src/cli/triage.ts:134`（schema-literal）；`apps/server/src/cli/triage.ts:146`（object-key）；`apps/server/src/cli/triage.ts:210`（object-key）；…（共 175 处）

### `agents`（A，message，1 处）

- 显示位置（照常转换）：`apps/web/src/components/chat/ThreadLineageWorkflowRow.tsx:208`（A，ThreadLineageWorkflowRow）
- 同一文本作为值用途字面量出现 26 次：`apps/server/src/orchestration-v2/Adapters/ClaudeAdapterV2.ts:5003`（object-key）；`apps/server/src/orchestration-v2/Adapters/claudeWorkflowProgress.ts:104`（object-key）；`apps/server/src/orchestration-v2/Adapters/claudeWorkflowProgress.ts:119`（object-key）；`apps/server/src/orchestration-v2/Adapters/claudeWorkflowProgress.ts:185`（object-key）；`apps/web/src/components/chat/agentSpawnSummary.ts:8`（object-key）；`apps/web/src/components/chat/agentSpawnSummary.ts:12`（object-key）；`apps/web/src/components/onboarding/WelcomeWizard.tsx:103`（ts-type）；`apps/web/src/components/onboarding/WelcomeWizard.tsx:163`（comparison）；`apps/web/src/components/onboarding/WelcomeWizard.tsx:277`（comparison）；`apps/web/src/rightPanelStore.ts:467`（comparison）；…（共 26 处）

### `and`（A，message，1 处）

- 显示位置（照常转换）：`apps/web/src/components/settings/KeybindingsSettings.tsx:504`（A，WhenExpressionNodeEditor）
- 同一文本作为值用途字面量出现 13 次：`apps/server/src/keybindings.ts:171`（switch-case）；`apps/web/src/components/settings/KeybindingsSettings.logic.ts:99`（switch-case）；`apps/web/src/components/settings/KeybindingsSettings.logic.ts:319`（switch-case）；`apps/web/src/components/settings/KeybindingsSettings.tsx:145`（ts-type）；`apps/web/src/components/settings/KeybindingsSettings.tsx:481`（comparison）；`apps/web/src/components/settings/KeybindingsSettings.tsx:504`（never-attribute）；`apps/web/src/keybindings.ts:77`（switch-case）；`packages/client-runtime/src/work-log/commandLabel.ts:73`（membership）；`packages/client-runtime/src/work-log/commandLabel.ts:161`（membership）；`packages/contracts/src/keybindings.ts:183`（schema-literal）；…（共 13 处）

### `approval`（A，message，1 处）

- 显示位置（照常转换）：`apps/web/src/components/pullRequest/PullRequestDetailPanel.tsx:2754`（A，PullRequestDetailPanel）
- 同一文本作为值用途字面量出现 32 次：`apps/server/src/orchestration-v2/Adapters/ClaudeAdapterV2.ts:3538`（ts-type）；`apps/server/src/orchestration-v2/Adapters/CodexAdapterV2.ts:1262`（ts-type）；`apps/web/src/components/Sidebar.logic.ts:881`（ts-type）；`apps/web/src/components/Sidebar.logic.ts:898`（comparison）；`apps/web/src/components/Sidebar.logic.ts:914`（comparison）；`apps/web/src/components/Sidebar.logic.ts:939`（ts-type）；`apps/web/src/components/Sidebar.logic.ts:959`（comparison）；`apps/web/src/components/Sidebar.logic.ts:1097`（comparison）；`apps/web/src/components/Sidebar.tsx:1699`（comparison）；`apps/web/src/components/Sidebar.tsx:1702`（as-const）；…（共 32 处）

### `approvals`（A，message，1 处）

- 显示位置（照常转换）：`apps/web/src/components/pullRequest/PullRequestDetailPanel.tsx:2754`（A，PullRequestDetailPanel）
- 同一文本作为值用途字面量出现 13 次：`apps/server/src/orchestration-v2/Adapters/ClaudeAdapterV2.ts:373`（object-key）；`apps/server/src/orchestration-v2/Adapters/CodexAdapterV2.ts:279`（object-key）；`apps/web/src/components/chat/usePendingThreadRequests.ts:66`（object-key）；`apps/web/src/components/clerk/MobileClientsUserProfilePage.logic.ts:9`（as-const）；`packages/client-runtime/src/state/threadRequests.ts:38`（object-key）；`packages/client-runtime/src/state/threadRequests.ts:110`（object-key）；`packages/contracts/src/orchestrationV2.ts:334`（object-key）；`packages/provider-acp/src/server/adapter.ts:513`（object-key）；`packages/provider-cursor/src/server/adapter.ts:127`（object-key）；`packages/provider-muse/src/server/adapter.ts:142`（object-key）；…（共 13 处）

### `as`（A，message，1 处）

- 显示位置（照常转换）：`apps/web/src/components/settings/SourceControlSettings.tsx:225`（A，itemSummary）
- 同一文本作为值用途字面量出现 2 次：`apps/web/src/components/ChatMarkdown.tsx:800`（object-key）；`apps/web/src/components/ChatMarkdown.tsx:810`（object-key）

### `author`（A，message，1 处）

- 显示位置（照常转换）：`apps/web/src/components/pullRequest/PullRequestTimelineTab.tsx:336`（A，ConversationGroup）
- 同一文本作为值用途字面量出现 117 次：`apps/server/src/orchestration-v2/PullRequestSyncReactor.ts:66`（object-key）；`apps/server/src/orchestration-v2/pullRequestWatch.ts:35`（ts-type）；`apps/server/src/pullRequest/PullRequestService.ts:1055`（object-key）；`apps/server/src/pullRequest/PullRequestService.ts:1491`（object-key）；`apps/server/src/pullRequest/PullRequestService.ts:1577`（object-key）；`apps/server/src/pullRequest/PullRequestService.ts:1625`（object-key）；`apps/server/src/pullRequest/PullRequestService.ts:1664`（object-key）；`apps/server/src/pullRequest/PullRequestService.ts:2628`（object-key）；`apps/server/src/pullRequest/PullRequestService.ts:2865`（object-key）；`apps/web/src/components/pullRequest/PullRequestCodeTab.tsx:901`（object-key）；…（共 117 处）

### `authors`（A，message，1 处）

- 显示位置（照常转换）：`apps/web/src/components/pullRequest/PullRequestTimelineTab.tsx:336`（A，ConversationGroup）
- 同一文本作为值用途字面量出现 16 次：`apps/web/src/components/pullRequest/pullRequestList.logic.ts:118`（object-key）；`packages/contracts/src/acpRegistry.ts:67`（object-key）；`packages/contracts/src/pullRequest.ts:237`（object-key）；`packages/provider-acp-registry/src/server/AcpRegistrySupport.ts:141`（object-key）；`packages/provider-acp-registry/src/server/AcpRegistrySupport.ts:1626`（object-key）；`packages/source-control-bitbucket/src/server/bitbucketPullRequestJson.ts:496`（object-key）；`packages/source-control-forgejo/src/server/forgejoPullRequestJson.ts:208`（object-key）；`packages/source-control-gitcafe/src/server/GitCafePullRequestProvider.ts:500`（key-argument）；`packages/source-control-github/src/server/GitHubPullRequestProvider.ts:435`（object-key）；`packages/source-control-github/src/server/gitHubPullRequestJson.ts:765`（object-key）；…（共 16 处）

### `auto-settle`（B，message，1 处）

- 显示位置（照常转换）：`apps/web/src/components/settings/SettingsPanels.tsx:2376`（B，GeneralSettingsPanel）
- 同一文本作为值用途字面量出现 2 次：`apps/web/src/components/threadActionMenu.logic.ts:12`（ts-type）；`apps/web/src/components/threadActionMenu.logic.ts:176`（as-const）

### `available`（A，message，1 处）

- 显示位置（照常转换）：`apps/web/src/components/device/DeviceHostAvailability.tsx:17`（A，DeviceHostAvailability）
- 同一文本作为值用途字面量出现 111 次：`apps/desktop/src/ipc/methods/wsl.ts:32`（object-key）；`apps/desktop/src/snapShot/DesktopSnapShot.ts:734`（object-key）；`apps/desktop/src/snapShot/DesktopSnapShot.ts:739`（object-key）；`apps/desktop/src/snapShot/DesktopSnapShot.ts:741`（object-key）；`apps/desktop/src/snapShot/DesktopSnapShot.ts:1052`（object-key）；`apps/desktop/src/snapShot/DesktopSnapShot.ts:1056`（object-key）；`apps/desktop/src/snapShot/DesktopSnapShot.ts:1062`（object-key）；`apps/desktop/src/snapShot/DesktopSnapShot.ts:1068`（object-key）；`apps/desktop/src/snapShot/DesktopSnapShot.ts:1082`（object-key）；`apps/desktop/src/snapShot/DesktopSnapShot.ts:1089`（object-key）；…（共 111 处）

### `base64`（A，message，1 处）

- 显示位置（照常转换）：`apps/web/src/components/settings/ScheduledTasksSettings.tsx:1660`（A，ScheduledTaskEditorForm）
- 同一文本作为值用途字面量出现 15 次：`apps/desktop/src/preview/FaviconCapture.ts:219`（comparison）；`apps/desktop/src/preview/FaviconCapture.ts:220`（membership）；`apps/desktop/src/preview/FaviconCapture.ts:227`（comparison）；`apps/server/src/htmlRender/HtmlRender.ts:306`（as-const）；`apps/server/src/imageMime.ts:54`（object-key）；`apps/server/src/imageMime.ts:74`（comparison）；`apps/server/src/imageMime.ts:111`（object-key）；`apps/server/src/orchestration-v2/toolOutputImageBytes.ts:9`（membership）；`apps/server/src/orchestration-v2/toolOutputImageBytes.ts:28`（comparison）；`apps/web/src/components/settings/ScheduledTasksSettings.tsx:1651`（comparison）；…（共 15 处）

### `chain`（A，message，1 处）

- 显示位置（照常转换）：`apps/web/src/components/ThreadStatusIndicators.tsx:355`（A，ThreadPullRequestsMiniList）
- 同一文本作为值用途字面量出现 5 次：`apps/web/src/components/ComposerPromptEditorTiptap.tsx:586`（object-key）；`apps/web/src/components/ComposerPromptEditorTiptap.tsx:609`（object-key）；`apps/web/src/components/ComposerPromptEditorTiptap.tsx:647`（object-key）；`apps/web/src/components/ComposerPromptEditorTiptap.tsx:665`（object-key）；`apps/web/src/components/ComposerPromptEditorTiptap.tsx:696`（object-key）

### `cost`（A，message，1 处）

- 显示位置（照常转换）：`apps/web/src/components/usage/UsagePage.tsx:822`（A，UsageOverview）
- 同一文本作为值用途字面量出现 28 次：`apps/server/src/textGeneration/OpenCode2TextGeneration.fixture.ts:41`（object-key）；`apps/server/src/textGeneration/OpenCode2TextGeneration.fixture.ts:318`（object-key）；`apps/server/src/textGeneration/OpenCode2TextGeneration.fixture.ts:338`（object-key）；`apps/web/src/components/usage/UsagePage.tsx:624`（ts-type）；`apps/web/src/components/usage/UsagePage.tsx:711`（comparison）；`apps/web/src/components/usage/UsagePage.tsx:718`（comparison）；`apps/web/src/components/usage/UsagePage.tsx:720`（comparison）；`apps/web/src/components/usage/UsagePage.tsx:759`（comparison）；`apps/web/src/components/usage/UsagePage.tsx:799`（comparison）；`apps/web/src/components/usage/UsagePage.tsx:811`（comparison）；…（共 28 处）

### `custom`（A，message，1 处）

- 显示位置（照常转换）：`apps/web/src/components/settings/ProviderModelsSection.tsx:525`（A，ProviderModelRow）
- 同一文本作为值用途字面量出现 84 次：`apps/server/src/git/GitManager.ts:839`（switch-case）；`apps/server/src/orchestration-v2/ThreadLaunchService.ts:363`（comparison）；`apps/web/src/components/settings/BranchNamingSettings.tsx:19`（object-key）；`apps/web/src/components/settings/BranchNamingSettings.tsx:117`（comparison）；`apps/web/src/components/settings/IntegrationsSettings.tsx:698`（object-key）；`apps/web/src/components/settings/IntegrationsSettings.tsx:747`（comparison）；`apps/web/src/components/settings/SettingInheritance.tsx:37`（object-key）；`apps/web/src/components/settings/SettingsPanels.logic.ts:191`（comparison）；`apps/web/src/components/settings/SettingsPanels.logic.ts:203`（comparison）；`apps/web/src/components/settings/SettingsPanels.logic.ts:318`（as-const）；…（共 84 处）

### `days`（A，message，1 处）

- 显示位置（照常转换）：`apps/web/src/components/settings/StorageSettings.tsx:153`（A，RetentionControl）
- 同一文本作为值用途字面量出现 28 次：`apps/server/src/auth/EnvironmentAuth.ts:872`（object-key）；`apps/server/src/scheduledTasks/Schedule.ts:29`（object-key）；`apps/server/src/storageCleanup.ts:1096`（object-key）；`apps/server/src/storageCleanup.ts:1102`（object-key）；`apps/web/src/components/CustomSnoozeDialog.tsx:64`（ts-type）；`apps/web/src/components/CustomSnoozeDialog.tsx:189`（object-key）；`apps/web/src/components/CustomSnoozeDialog.tsx:191`（comparison）；`apps/web/src/components/CustomSnoozeDialog.tsx:202`（never-attribute）；`apps/web/src/components/usage/UsageModelDialog.tsx:28`（object-key）；`apps/web/src/components/usage/UsagePage.tsx:195`（object-key）；…（共 28 处）

### `folder`（A，message，1 处）

- 显示位置（照常转换）：`apps/web/src/components/onboarding/WelcomeWizard.tsx:1579`（A，ImportCandidateList）
- 同一文本作为值用途字面量出现 10 次：`apps/server/src/project/ManagedProjectFolders.ts:40`（object-key）；`apps/server/src/project/ManagedProjectFolders.ts:66`（object-key）；`apps/server/src/project/ManagedProjectFolders.ts:263`（object-key）；`apps/server/src/project/ManagedProjectFolders.ts:351`（object-key）；`apps/server/src/project/ManagedProjectFolders.ts:353`（object-key）；`apps/server/src/project/ManagedProjectFolders.ts:366`（object-key）；`apps/server/src/project/ManagedProjectFolders.ts:382`（object-key）；`apps/server/src/project/ManagedProjectFolders.ts:386`（object-key）；`apps/server/src/project/ManagedProjectFolders.ts:441`（object-key）；`apps/web/src/contextMenuFallback.ts:39`（object-key）

### `folders`（A，message，1 处）

- 显示位置（照常转换）：`apps/web/src/components/onboarding/WelcomeWizard.tsx:1579`（A，ImportCandidateList）
- 同一文本作为值用途字面量出现 5 次：`apps/web/src/components/chat/ChatComposer.tsx:5841`（object-key）；`apps/web/src/components/chat/workspaceFileDrop.ts:37`（object-key）；`apps/web/src/components/chat/workspaceFileDrop.ts:40`（object-key）；`apps/web/src/components/chat/workspaceFileDrop.ts:54`（object-key）；`apps/web/src/components/chat/workspaceFileDrop.ts:81`（object-key）

### `gh auth login`（A，message，1 处）

- 显示位置（照常转换）：`apps/web/src/components/settings/GitHubAccountSettings.tsx:73`（A，GitHubAccountSettings）
- 同一文本作为值用途字面量出现 1 次：`apps/server/src/vcs/VcsProcess.ts:125`（membership）

### `hex`（A，message，1 处）

- 显示位置（照常转换）：`apps/web/src/components/settings/ScheduledTasksSettings.tsx:1659`（A，ScheduledTaskEditorForm）
- 同一文本作为值用途字面量出现 9 次：`apps/server/src/preview/PreviewBrowser.ts:235`（comparison）；`apps/server/src/provider/AntigravityInstallation.ts:574`（comparison）；`apps/server/src/provider/CodexInstallation.ts:543`（comparison）；`apps/server/src/scheduledTasks/webhookVerification.ts:26`（comparison）；`apps/server/src/scheduledTasks/webhookVerification.ts:29`（comparison）；`apps/web/src/components/settings/ScheduledTasksSettings.tsx:1659`（never-attribute）；`apps/web/src/components/settings/scheduledTasksSettings.logic.ts:83`（ts-type）；`apps/web/src/components/settings/scheduledTasksSettings.logic.ts:98`（as-const）；`packages/contracts/src/scheduledTask.ts:63`（schema-literal）

### `in`（A，message，1 处）

- 显示位置（照常转换）：`apps/web/src/components/chat/DraftHeroProjectHeading.tsx:51`（A，DraftHeroProjectHeading）
- 同一文本作为值用途字面量出现 16 次：`apps/desktop/src/preview/Manager.ts:372`（ts-type）；`apps/desktop/src/preview/Manager.ts:374`（comparison）；`apps/desktop/src/window/DesktopWindow.ts:89`（ts-type）；`apps/desktop/src/window/DesktopWindow.ts:341`（comparison）；`apps/server/src/scheduledTasks/webhookFilter.ts:26`（switch-case）；`apps/web/src/components/settings/ScheduledTasksSettings.tsx:243`（comparison）；`apps/web/src/composer-code-block.ts:21`（ts-type）；`apps/web/src/composer-code-block.ts:23`（comparison）；`apps/web/src/composer-code-block.ts:124`（ts-type）；`apps/web/src/composer-code-block.ts:134`（comparison）；…（共 16 处）

### `left`（A，message，1 处）

- 显示位置（照常转换）：`apps/web/src/components/usage/UsageLimitsPooled.tsx:547`（A，PoolWindowCard）
- 同一文本作为值用途字面量出现 145 次：`apps/desktop/src/preview/PickPreload.ts:645`（object-key）；`apps/desktop/src/preview/PickPreload.ts:995`（object-key）；`apps/desktop/src/preview/PickPreload.ts:999`（object-key）；`apps/desktop/src/preview/PickPreload.ts:1010`（object-key）；`apps/desktop/src/preview/PickPreload.ts:1037`（object-key）；`apps/desktop/src/preview/PickPreload.ts:1038`（object-key）；`apps/desktop/src/preview/PickPreload.ts:1040`（object-key）；`apps/desktop/src/preview/PickPreload.ts:1044`（object-key）；`apps/desktop/src/preview/PickPreload.ts:1048`（object-key）；`apps/desktop/src/preview/PickPreload.ts:1074`（object-key）；…（共 145 处）

### `minutes`（A，message，1 处）

- 显示位置（照常转换）：`apps/web/src/components/settings/ScheduledTasksSettings.tsx:1738`（A，ScheduledTaskEditorForm）
- 同一文本作为值用途字面量出现 12 次：`apps/server/src/cli/trace.ts:98`（object-key）；`apps/server/src/cloud/CloudLink.ts:607`（object-key）；`apps/server/src/cloud/CloudLink.ts:1523`（object-key）；`apps/server/src/orchestration-v2/PullRequestWatchReactor.ts:233`（object-key）；`apps/server/src/orchestration-v2/RunExecutionService.ts:1478`（object-key）；`apps/server/src/relay/AgentAwarenessRelay.ts:257`（object-key）；`apps/web/src/components/CustomSnoozeDialog.tsx:64`（ts-type）；`apps/web/src/components/CustomSnoozeDialog.tsx:189`（object-key）；`apps/web/src/components/CustomSnoozeDialog.tsx:191`（comparison）；`apps/web/src/components/CustomSnoozeDialog.tsx:200`（never-attribute）；…（共 12 处）

### `none`（A，message，1 处）

- 显示位置（照常转换）：`apps/web/src/components/GitActionsControl.tsx:1910`（A，GitActionsControl）
- 同一文本作为值用途字面量出现 145 次：`apps/desktop/src/electron/ElectronDialog.ts:42`（schema-literal）；`apps/desktop/src/preview/FaviconCapture.ts:37`（ts-type）；`apps/desktop/src/preview/Manager.ts:111`（ts-type）；`apps/desktop/src/preview/PickPreload.ts:64`（comparison）；`apps/desktop/src/preview/PickPreload.ts:84`（comparison）；`apps/desktop/src/preview/PickPreload.ts:1063`（comparison）；`apps/desktop/src/preview/RecordingCursor.ts:43`（ts-type）；`apps/server/src/auth/mcpOAuthHttp.ts:80`（as-const）；`apps/server/src/cloud/managedTunnelStartup.ts:20`（ts-type）；`apps/server/src/device/DeviceActions.ts:535`（comparison）；…（共 145 处）

### `now`（A，message，1 处）

- 显示位置（照常转换）：`apps/web/src/components/chat/ComposerTasksBadge.tsx:210`（A，ComposerTasksContent）
- 同一文本作为值用途字面量出现 189 次：`apps/server/src/auth/PairingGrantStore.ts:337`（object-key）；`apps/server/src/auth/PairingGrantStore.ts:552`（object-key）；`apps/server/src/auth/SessionStore.ts:970`（object-key）；`apps/server/src/background/BackgroundPolicy.ts:184`（object-key）；`apps/server/src/background/BackgroundPolicy.ts:231`（object-key）；`apps/server/src/mcp/McpSessionRegistry.ts:59`（object-key）；`apps/server/src/orchestration-v2/Adapters/ClaudeAdapterV2.ts:1482`（object-key）；`apps/server/src/orchestration-v2/Adapters/ClaudeAdapterV2.ts:1604`（object-key）；`apps/server/src/orchestration-v2/Adapters/ClaudeAdapterV2.ts:3893`（object-key）；`apps/server/src/orchestration-v2/Adapters/ClaudeAdapterV2.ts:5021`（object-key）；…（共 189 处）

### `optionId`（B，message，1 处）

- 显示位置（照常转换）：`apps/web/src/components/settings/CustomModelEditor.tsx:220`（B，renderDescriptor）
- 同一文本作为值用途字面量出现 19 次：`apps/server/src/provider/acp/AntigravityProtocol.ts:170`（object-key）；`apps/server/src/provider/acp/AntigravityProtocol.ts:174`（object-key）；`apps/web/src/components/chat/ComposerCommandMenu.tsx:163`（object-key）；`packages/effect-acp/src/_generated/schema-v1.gen.ts:3109`（object-key）；`packages/effect-acp/src/_generated/schema-v1.gen.ts:3119`（object-key）；`packages/effect-acp/src/_generated/schema-v1.gen.ts:3138`（object-key）；`packages/effect-acp/src/_generated/schema-v1.gen.ts:3144`（object-key）；`packages/effect-acp/src/_generated/schema-v1.gen.ts:9032`（object-key）；`packages/effect-acp/src/_generated/schema-v1.gen.ts:9036`（object-key）；`packages/effect-acp/src/_generated/schema.gen.ts:3168`（object-key）；…（共 19 处）

### `or`（A，message，1 处）

- 显示位置（照常转换）：`apps/web/src/components/settings/KeybindingsSettings.tsx:505`（A，WhenExpressionNodeEditor）
- 同一文本作为值用途字面量出现 13 次：`apps/server/src/keybindings.ts:173`（switch-case）；`apps/web/src/components/settings/KeybindingsSettings.logic.ts:101`（switch-case）；`apps/web/src/components/settings/KeybindingsSettings.logic.ts:320`（switch-case）；`apps/web/src/components/settings/KeybindingsSettings.tsx:145`（ts-type）；`apps/web/src/components/settings/KeybindingsSettings.tsx:429`（comparison）；`apps/web/src/components/settings/KeybindingsSettings.tsx:505`（never-attribute）；`apps/web/src/keybindings.ts:79`（switch-case）；`packages/client-runtime/src/work-log/commandLabel.ts:125`（membership）；`packages/client-runtime/src/work-log/commandLabel.ts:186`（membership）；`packages/contracts/src/keybindings.ts:188`（schema-literal）；…（共 13 处）

### `origin`（B，message，1 处）

- 显示位置（照常转换）：`apps/web/src/components/GitActionsControl.tsx:818`（B，PublishRepositoryDialog）
- 同一文本作为值用途字面量出现 131 次：`apps/desktop/src/electron/ElectronProtocol.ts:182`（comparison）；`apps/desktop/src/preview/PasskeyBackend.ts:5`（object-key）；`apps/desktop/src/preview/Passkeys.ts:189`（object-key）；`apps/server/src/cli/pair.ts:169`（object-key）；`apps/server/src/cli/pair.ts:523`（object-key）；`apps/server/src/cli/project.ts:360`（object-key）；`apps/server/src/cli/project.ts:366`（object-key）；`apps/server/src/cli/project.ts:377`（object-key）；`apps/server/src/cli/project.ts:380`（object-key）；`apps/server/src/cli/sshHelper.ts:106`（object-key）；…（共 131 处）

### `outdated`（A，message，1 处）

- 显示位置（照常转换）：`apps/web/src/components/pullRequest/PullRequestReviewAnnotation.tsx:236`（A，ReviewThreadCard）
- 同一文本作为值用途字面量出现 5 次：`packages/client-runtime/src/connection/diagnosis.ts:49`（ts-type）；`packages/client-runtime/src/connection/diagnosis.ts:87`（switch-case）；`packages/client-runtime/src/connection/diagnosis.ts:144`（switch-case）；`packages/client-runtime/src/connection/diagnosis.ts:219`（switch-case）；`packages/source-control-bitbucket/src/server/bitbucketPullRequestJson.ts:108`（object-key）

### `override`（B，message，1 处）

- 显示位置（照常转换）：`apps/web/src/components/settings/settingsLayout.tsx:381`（B，SettingsRow）
- 同一文本作为值用途字面量出现 4 次：`apps/server/src/provider/AntigravityInstallation.ts:78`（ts-type）；`apps/server/src/provider/AntigravityInstallation.ts:250`（ts-type）；`packages/contracts/src/relayClient.ts:7`（schema-literal）；`packages/shared/src/relayClient.ts:36`（ts-type）

### `process`（A，message，1 处）

- 显示位置（照常转换）：`apps/web/src/components/settings/ResourceTelemetryDiagnostics.tsx:276`（A，AggregateCard）
- 同一文本作为值用途字面量出现 62 次：`apps/desktop/src/wsl/DesktopWslEnvironment.ts:148`（ts-type）；`apps/desktop/src/wsl/DesktopWslEnvironment.ts:167`（switch-case）；`apps/server/src/resourceTelemetry/Model.ts:17`（object-key）；`apps/server/src/resourceTelemetry/Model.ts:567`（object-key）；`apps/server/src/resourceTelemetry/ResourceTelemetryHistory.ts:44`（object-key）；`apps/server/src/resourceTelemetry/ResourceTelemetryHistory.ts:268`（object-key）；`apps/server/src/serviceLauncher.ts:52`（object-key）；`apps/server/src/serviceLauncher.ts:641`（object-key）；`apps/server/src/sourceControl/ServerSourceControlHost.ts:19`（object-key）；`apps/server/src/sourceControl/SourceControlProviderRegistry.ts:243`（object-key）；…（共 62 处）

### `processes`（A，message，1 处）

- 显示位置（照常转换）：`apps/web/src/components/settings/ResourceTelemetryDiagnostics.tsx:276`（A，AggregateCard）
- 同一文本作为值用途字面量出现 20 次：`apps/server/src/diagnostics/ProcessDiagnostics.ts:84`（object-key）；`apps/server/src/resourceTelemetry/Model.ts:60`（object-key）；`apps/server/src/resourceTelemetry/Model.ts:602`（object-key）；`apps/server/src/resourceTelemetry/NativeTelemetryClient.ts:680`（object-key）；`apps/server/src/resourceTelemetry/NativeTelemetryClient.ts:854`（object-key）；`apps/server/src/resourceTelemetry/ResourceTelemetry.ts:187`（object-key）；`apps/server/src/resourceTelemetry/ResourceTelemetry.ts:300`（object-key）；`apps/web/src/components/settings/DiagnosticsSettings.tsx:322`（object-key）；`apps/web/src/components/settings/DiagnosticsSettings.tsx:328`（object-key）；`apps/web/src/components/settings/DiagnosticsSettings.tsx:564`（object-key）；…（共 20 处）

### `retrying`（A，message，1 处）

- 显示位置（照常转换）：`apps/web/src/components/settings/ConnectionDiagnosisDetails.tsx:74`（A，RetryCountdown）
- 同一文本作为值用途字面量出现 6 次：`apps/web/src/components/onboarding/FirstRunGate.tsx:102`（comparison）；`apps/web/src/components/onboarding/FirstRunGate.tsx:176`（comparison）；`apps/web/src/components/onboarding/FirstRunGate.tsx:189`（object-key）；`apps/web/src/components/onboarding/FirstRunGate.tsx:192`（object-key）；`apps/web/src/hooks/useSettings.ts:70`（ts-type）；`apps/web/src/hooks/useSettings.ts:141`（comparison）

### `root`（B，message，1 处）

- 显示位置（照常转换）：`apps/web/src/components/settings/ConnectionsSettings.tsx:3035`（B，renderSshFields）
- 同一文本作为值用途字面量出现 112 次：`apps/desktop/src/snapShot/SnapShotAccessibility.ts:46`（ts-type）；`apps/desktop/src/snapShot/SnapShotAccessibility.ts:74`（object-key）；`apps/desktop/src/snapShot/SnapShotAccessibility.ts:88`（object-key）；`apps/desktop/src/snapShot/snapShot.ts:303`（object-key）；`apps/desktop/src/snapShot/snapShot.ts:339`（object-key）；`apps/desktop/src/snapShot/snapShot.ts:358`（object-key）；`apps/desktop/src/snapShot/snapShot.ts:438`（object-key）；`apps/desktop/src/wsl/DesktopWslServerTree.ts:21`（object-key）；`apps/desktop/src/wsl/DesktopWslServerTree.ts:184`（object-key）；`apps/desktop/src/wsl/DesktopWslServerTree.ts:188`（object-key）；…（共 112 处）

### `server`（B，message，1 处）

- 显示位置（照常转换）：`apps/web/src/components/settings/ConnectionsSettings.tsx:3534`（B，ConnectionsSettings）
- 同一文本作为值用途字面量出现 257 次：`apps/desktop/src/app/DesktopAppActivation.ts:206`（object-key）；`apps/desktop/src/app/DesktopAppActivation.ts:220`（object-key）；`apps/desktop/src/app/DesktopAppActivation.ts:239`（object-key）；`apps/server/src/cli/triage.ts:180`（object-key）；`apps/server/src/cli/triagePrompt.ts:180`（object-key）；`apps/server/src/diagnostics/ProcessResourceMonitor.ts:24`（comparison）；`apps/server/src/diagnostics/ProcessResourceMonitor.ts:45`（comparison）；`apps/server/src/htmlRender/publicProxy.ts:130`（object-key）；`apps/server/src/htmlRender/publicProxy.ts:205`（object-key）；`apps/server/src/htmlRender/publicProxy.ts:208`（object-key）；…（共 257 处）

### `setup`（A，message，1 处）

- 显示位置（照常转换）：`apps/web/src/components/settings/ProjectActionsList.tsx:38`（A，ProjectActionsList）
- 同一文本作为值用途字面量出现 16 次：`apps/desktop/src/snapShot/DesktopSnapShot.ts:177`（object-key）；`apps/desktop/src/snapShot/DesktopSnapShot.ts:1581`（object-key）；`apps/server/src/project/ProjectSetupScriptRunner.ts:61`（ts-type）；`apps/server/src/provider/AntigravityProvider.ts:154`（object-key）；`apps/server/src/provider/Drivers/CodexManagedProvider.ts:63`（object-key）；`apps/server/src/provider/Drivers/CodexManagedProvider.ts:157`（object-key）；`apps/server/src/provider/unavailableProviderSnapshot.ts:29`（object-key）；`apps/web/src/components/files/useFileSaveCoordinator.ts:84`（object-key）；`apps/web/src/components/settings/ProviderInstanceCard.tsx:579`（object-key）；`apps/web/src/components/settings/ProviderInstanceCard.tsx:630`（object-key）；…（共 16 处）

### `stack`（A，message，1 处）

- 显示位置（照常转换）：`apps/web/src/components/ThreadStatusIndicators.tsx:355`（A，ThreadPullRequestsMiniList）
- 同一文本作为值用途字面量出现 78 次：`apps/desktop/src/preview/PickPreload.ts:435`（object-key）；`apps/desktop/src/preview/PickPreload.ts:446`（object-key）；`apps/desktop/src/preview/PickedElementPayload.ts:34`（computed-key）；`apps/desktop/src/preview/PickedElementPayload.ts:35`（computed-key）；`apps/server/src/git/detachStackFrame.ts:9`（object-key）；`apps/server/src/mcp/toolkits/pullRequests/handlers.ts:122`（ts-type）；`apps/server/src/mcp/toolkits/pullRequests/handlers.ts:143`（object-key）；`apps/server/src/mcp/toolkits/pullRequests/tools.ts:250`（object-key）；`apps/server/src/orchestration-v2/Orchestrator.ts:589`（object-key）；`apps/server/src/orchestration-v2/Orchestrator.ts:3226`（comparison）；…（共 78 处）

### `team`（A，message，1 处）

- 显示位置（照常转换）：`apps/web/src/components/pullRequest/PullRequestReviewerPicker.tsx:112`（A，PullRequestReviewerPicker）
- 同一文本作为值用途字面量出现 6 次：`apps/server/src/provider/ClaudeProvider.ts:103`（switch-case）；`apps/server/src/provider/CodexProvider.ts:139`（switch-case）；`apps/web/src/components/pullRequest/PullRequestReviewerPicker.tsx:111`（comparison）；`packages/contracts/src/pullRequest.ts:201`（schema-literal）；`packages/provider-cursor/src/server/adapter.ts:303`（as-const）；`packages/source-control-github/src/server/gitHubPullRequestJson.ts:1621`（comparison）

### `unavailable`（A，message，1 处）

- 显示位置（照常转换）：`apps/web/src/components/device/DeviceHostAvailability.tsx:17`（A，DeviceHostAvailability）
- 同一文本作为值用途字面量出现 114 次：`apps/desktop/src/backend/DesktopServerExposure.ts:316`（object-key）；`apps/desktop/src/backend/DesktopServerExposure.ts:416`（object-key）；`apps/desktop/src/preview/BrowserImport/BrowserImport.ts:174`（object-key）；`apps/desktop/src/snapShot/DesktopSnapShot.ts:900`（comparison）；`apps/desktop/src/snapShot/DesktopSnapShot.ts:1051`（comparison）；`apps/desktop/src/snapShot/DesktopSnapShot.ts:1125`（comparison）；`apps/desktop/src/snapShot/DesktopSnapShot.ts:1136`（comparison）；`apps/desktop/src/snapShot/DesktopSnapShot.ts:1139`（comparison）；`apps/desktop/src/snapShot/DesktopSnapShot.ts:1171`（comparison）；`apps/desktop/src/snapShot/DesktopSnapShot.ts:1178`（comparison）；…（共 114 处）

### `viewed`（A，message，1 处）

- 显示位置（照常转换）：`apps/web/src/components/pullRequest/PullRequestCodeTab.tsx:1055`（A，PullRequestCodeTab）
- 同一文本作为值用途字面量出现 15 次：`apps/server/src/persistence/PullRequestFilesViewed.ts:38`（object-key）；`apps/server/src/pullRequest/pullRequestViewedFiles.ts:225`（as-const）；`apps/server/src/pullRequest/pullRequestViewedFiles.ts:231`（as-const）；`apps/server/src/pullRequest/pullRequestViewedFiles.ts:303`（object-key）；`apps/web/src/components/pullRequest/pullRequestFilesViewed.logic.ts:15`（comparison）；`apps/web/src/components/pullRequest/pullRequestFilesViewed.logic.ts:59`（object-key）；`apps/web/src/components/pullRequest/pullRequestFilesViewed.logic.ts:63`（object-key）；`apps/web/src/components/pullRequest/pullRequestFilesViewed.logic.ts:72`（object-key）；`apps/web/src/components/pullRequest/pullRequestFilesViewed.logic.ts:73`（object-key）；`packages/contracts/src/pullRequest.ts:670`（schema-literal）；…（共 15 处）
