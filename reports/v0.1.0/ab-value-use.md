# A/B 值用途重名 v0.1.0

A（JSX 文本/子表达式）和 B 原始白名单属性的文字，即使同一文本也出现在「从不转换」的值用途位置（比较、`switch case`、`as const`、字面量类型、对象键），仍照常转换——它们只用于显示。§4 要求把这些位置列出以便人工核对：若上游将来改成拿这些字段做判断，就需要改判定。

共 225 处显示位置（120 条文字）。此清单与 suspicious、可翻译计数分开统计，不计入可翻译位置总数。

### `Off`（A，message，12 处）

- 显示位置（照常转换）：`apps/web/src/components/chat/TraitsPicker.tsx:474`（A，TraitsMenuContent）；`apps/web/src/components/clerk/MobileClientsUserProfilePage.tsx:31`（A，MobileClientStatusBadge）；`apps/web/src/components/onboarding/WelcomeWizard.tsx:370`（A，ConnectionStep）；`apps/web/src/components/settings/ConnectionsSettings.tsx:3462`（A，renderWslRow）；`apps/web/src/components/settings/GitHubRoutingSettings.tsx:72`（B，GitHubRoutingSettings）；`apps/web/src/components/settings/LoadBalancingSettings.tsx:77`（B，LoadBalancingSettings）；`apps/web/src/components/settings/ProviderInstanceCard.tsx:572`（A，ProjectOverrideInheritance）；`apps/web/src/components/settings/SnapShotSettings.tsx:500`（A，SnapShotSettings）；`apps/web/src/components/settings/SnapShotSettings.tsx:517`（A，SnapShotSettings）；`apps/web/src/components/settings/StorageSettings.tsx:157`（A，RetentionControl）；`apps/web/src/components/settings/StorageSettings.tsx:503`（A，StorageSettingsPanel）；`apps/web/src/components/settings/StorageSettings.tsx:509`（A，StorageSettingsPanel）
- 同一文本作为值用途字面量出现 2 次：`packages/shared/src/otelEnvironment.ts:32`（object-key）；`packages/shared/src/otelEnvironment.ts:392`（object-key）

### `Close`（B，message，8 处）

- 显示位置（照常转换）：`apps/web/src/components/chat/HtmlRenderDialog.tsx:30`（B，HtmlRenderDialog）；`apps/web/src/components/files/AttachmentFilePreview.tsx:351`（B，AttachmentFilePreview）；`apps/web/src/components/onboarding/WelcomeWizard.tsx:1166`（A，AgentInstallTerminal）；`apps/web/src/components/settings/BrowserImportWizard.tsx:601`（A，BlockedStep）；`apps/web/src/components/settings/ProjectFaviconPickerDialog.tsx:80`（B，ProjectFaviconPickerDialog）；`apps/web/src/components/settings/SnapShotSetupDialog.tsx:392`（A，SnapShotSetupDialog）；`apps/web/src/components/ui/dialog.tsx:96`（B，DialogPopup）；`apps/web/src/components/ui/sheet.tsx:112`（B，SheetPopup）
- 同一文本作为值用途字面量出现 2 次：`apps/desktop/src/backend/DesktopBackendPool.ts:211`（ts-type）；`apps/desktop/src/backend/DesktopBackendPool.ts:405`（as-const）

### `Default`（A，message，6 处）

- 显示位置（照常转换）：`apps/web/src/components/chat/TraitsPicker.tsx:98`（A，DefaultBadge）；`apps/web/src/components/settings/ConnectionsSettings.tsx:1358`（A，AdvertisedEndpointListRow）；`apps/web/src/components/settings/CustomModelEditor.tsx:181`（A，renderChoice）；`apps/web/src/components/settings/DeviceHostEditor.tsx:131`（B，DeviceHostEditor）；`apps/web/src/components/settings/IntegrationsSettings.tsx:1369`（A，BrowserProfilesSetting）；`apps/web/src/components/settings/StorageSettings.tsx:88`（B，WorktreesDirectoryRow）
- 同一文本作为值用途字面量出现 4 次：`apps/web/src/components/device/DeviceControlsRail.tsx:167`（as-const）；`apps/web/src/components/settings/KeybindingsSettings.logic.ts:48`（ts-type）；`apps/web/src/components/settings/KeybindingsSettings.tsx:901`（comparison）；`apps/web/src/components/settings/KeybindingsSettings.tsx:936`（comparison）

### `Mixed`（B，message，6 处）

- 显示位置（照常转换）：`apps/web/src/components/settings/BranchNamingSettings.tsx:105`（B，BranchNamingSettings）；`apps/web/src/components/settings/ProjectDefaultsSettings.tsx:318`（A，ProjectDefaultsSettings）；`apps/web/src/components/settings/SettingsPanels.tsx:3135`（B，GeneralSettingsPanel）；`apps/web/src/components/settings/StorageSettings.tsx:88`（B，WorktreesDirectoryRow）；`apps/web/src/components/settings/StorageSettings.tsx:499`（A，StorageSettingsPanel）；`apps/web/src/components/settings/StorageSettings.tsx:630`（A，StorageSettingsPanel）
- 同一文本作为值用途字面量出现 1 次：`apps/web/src/components/usage/UsagePriceOverrides.tsx:212`（comparison）

### `None`（A，message，5 处）

- 显示位置（照常转换）：`apps/web/src/components/device/DeviceToolVersions.tsx:69`（A，DeviceToolVersions）；`apps/web/src/components/pullRequest/PullRequestGhosts.tsx:344`（A，PullRequestDetailGhost）；`apps/web/src/components/pullRequest/PullRequestSummaryTab.tsx:668`（A，PullRequestSummaryTab）；`apps/web/src/components/pullRequest/PullRequestSummaryTab.tsx:753`（A，PullRequestSummaryTab）；`apps/web/src/components/settings/ScheduledTasksSettings.tsx:1245`（B，ScheduledTaskEditorDialog）
- 同一文本作为值用途字面量出现 22 次：`apps/server/src/device/LocalDeviceHost.ts:330`（comparison）；`apps/server/src/process/agentScope.ts:148`（comparison）；`apps/server/src/process/agentScope.ts:160`（comparison）；`apps/server/src/process/agentScope.ts:213`（comparison）；`apps/server/src/process/agentScope.ts:245`（comparison）；`apps/server/src/project/RepositoryIdentityResolver.ts:131`（comparison）；`apps/server/src/project/RepositoryIdentityResolver.ts:153`（comparison）；`apps/server/src/vcs/VcsStatusBroadcaster.ts:162`（comparison）；`apps/server/src/workspace/WorkspaceFileSystem.ts:156`（comparison）；`apps/web/src/assets/assetUrls.ts:82`（comparison）；…（共 22 处）

### `Sign in`（A，message，5 处）

- 显示位置（照常转换）：`apps/web/src/components/cloud/ConnectCliAuthSurface.tsx:107`（A，ConnectCliAuthorizeSurface）；`apps/web/src/components/onboarding/WelcomeWizard.tsx:502`（A，ConnectAccountOption）；`apps/web/src/components/onboarding/WelcomeWizard.tsx:1013`（A，AgentCard）；`apps/web/src/components/settings/ProviderAuthenticationSection.tsx:298`（A，ProviderAuthenticationSection）；`apps/web/src/components/settings/ProviderWizardAuthenticationStep.tsx:71`（A，ProviderWizardAuthenticationStep）
- 同一文本作为值用途字面量出现 1 次：`apps/web/src/components/settings/AddProviderInstanceDialog.logic.ts:9`（as-const）

### `Unavailable`（A，message，5 处）

- 显示位置（照常转换）：`apps/web/src/components/chat/ModelListRow.tsx:81`（A，ModelListRow）；`apps/web/src/components/chat/ProviderModelPicker.tsx:281`（A，ProviderModelPicker）；`apps/web/src/components/cloud/CloudEnvironmentConnectList.tsx:424`（A，CloudEnvironmentConnectRows）；`apps/web/src/components/settings/CodexSetupSection.tsx:1057`（B，CodexManagedRuntimeFields）；`apps/web/src/components/settings/CodexSetupSection.tsx:1076`（B，CodexManagedRuntimeFields）
- 同一文本作为值用途字面量出现 2 次：`apps/web/src/components/settings/ResourceTelemetryDiagnostics.tsx:1206`（never-attribute）；`apps/web/src/components/usage/UsagePriceOverrides.tsx:213`（comparison）

### `Actions`（A，message，4 处）

- 显示位置（照常转换）：`apps/web/src/components/ProjectScriptsControl.tsx:392`（A，ProjectScriptsControl）；`apps/web/src/components/ProjectScriptsControl.tsx:433`（A，ProjectScriptsControl）；`apps/web/src/components/settings/ProjectActionsSettings.tsx:137`（B，ProjectActionsSettings）；`apps/web/src/components/settings/ProjectActionsSettings.tsx:142`（B，ProjectActionsSettings）
- 同一文本作为值用途字面量出现 1 次：`apps/web/src/components/chat/ComposerBanner.tsx:361`（object-key）

### `Codex`（B，message，4 处）

- 显示位置（照常转换）：`apps/web/src/components/onboarding/WelcomeWizard.tsx:1802`（B，ImportRowMeta）；`apps/web/src/components/settings/CodexSetupSection.tsx:70`（B，CodexSetupSection）；`apps/web/src/components/settings/CodexSetupSection.tsx:130`（B，CodexSetupSection）；`apps/web/src/components/settings/CodexSetupSection.tsx:772`（B，ManagedCodexSetup）
- 同一文本作为值用途字面量出现 1 次：`apps/server/src/provider/CodexProvider.ts:77`（as-const）

### `Command`（A，message，4 处）

- 显示位置（照常转换）：`apps/web/src/components/projectScriptEditor.tsx:413`（A，ProjectScriptEditorDialog）；`apps/web/src/components/settings/DiagnosticsSettings.tsx:371`（A，ProcessDiagnosticsTable）；`apps/web/src/components/settings/DiagnosticsSettings.tsx:600`（A，ProcessResourceHistoryTable）；`apps/web/src/components/settings/KeybindingsSettings.tsx:1115`（B，NewKeybindingCommandSelect）
- 同一文本作为值用途字面量出现 2 次：`apps/web/src/lib/embeddedScripts.ts:244`（switch-case）；`apps/web/src/shortcutModifierState.ts:82`（switch-case）

### `Dismiss`（A，message，4 处）

- 显示位置（照常转换）：`apps/web/src/browser/ServerBrowserSurface.tsx:868`（A，ServerBrowserSurface）；`apps/web/src/components/ChatView.tsx:7541`（B，threadStatusLine）；`apps/web/src/components/desktop/SshPasswordPromptDialog.tsx:212`（A，ActiveSshPasswordPrompt）；`apps/web/src/components/sidebar/SidebarUpdateCapsule.tsx:193`（A，SidebarUpdateCapsule）
- 同一文本作为值用途字面量出现 1 次：`apps/web/src/components/chat/ComposerBanner.tsx:368`（object-key）

### `Loading`（A，message，4 处）

- 显示位置（照常转换）：`apps/web/src/components/settings/AcpSessionManagementSection.tsx:362`（A，AcpSessionManagementSection）；`apps/web/src/components/settings/AcpSessionManagementSection.tsx:435`（A，AcpSessionManagementSection）；`apps/web/src/components/settings/AcpSessionManagementSection.tsx:458`（A，AcpSessionManagementSection）；`apps/web/src/components/ui/spinner.tsx:31`（B，Spinner）
- 同一文本作为值用途字面量出现 10 次：`apps/desktop/src/preview/Manager.ts:89`（ts-type）；`apps/desktop/src/preview/Manager.ts:1904`（comparison）；`apps/desktop/src/preview/Manager.ts:1957`（comparison）；`apps/server/src/preview/ServerBrowser.ts:925`（comparison）；`apps/web/src/components/preview/PreviewView.tsx:232`（comparison）；`apps/web/src/components/preview/usePreviewBridge.ts:111`（comparison）；`apps/web/src/components/preview/usePreviewBridge.ts:111`（comparison）；`apps/web/src/components/preview/usePreviewBridge.ts:122`（comparison）；`packages/client-runtime/src/state/assets.ts:71`（ts-type）；`packages/contracts/src/ipc.ts:603`（ts-type）

### `Ready`（A，message，4 处）

- 显示位置（照常转换）：`apps/web/src/components/device/DeviceSetup.tsx:313`（A，PlatformStatus）；`apps/web/src/components/onboarding/WelcomeWizard.tsx:997`（A，AgentCard）；`apps/web/src/components/settings/CodexSetupSection.tsx:100`（A，CodexSetupSection）；`apps/web/src/components/settings/CodexSetupSection.tsx:814`（A，ManagedCodexSetup）
- 同一文本作为值用途字面量出现 5 次：`apps/desktop/src/backend/DesktopBackendConfiguration.ts:292`（ts-type）；`apps/desktop/src/backend/DesktopBackendConfiguration.ts:448`（as-const）；`apps/desktop/src/backend/DesktopBackendConfiguration.ts:499`（as-const）；`apps/desktop/src/backend/DesktopBackendConfiguration.ts:723`（comparison）；`apps/desktop/src/backend/DesktopBackendConfiguration.ts:765`（comparison）

### `Android`（A，message，3 处）

- 显示位置（照常转换）：`apps/web/src/components/NightlyMobileBeta.tsx:132`（A，NightlyMobileBetaRow）；`apps/web/src/components/RightPanelTabs.tsx:1519`（A，DeviceTabTooltip）；`apps/web/src/components/device/DeviceHostAvailability.tsx:16`（A，DeviceHostAvailability）
- 同一文本作为值用途字面量出现 2 次：`apps/server/src/ws.ts:678`（comparison）；`packages/contracts/src/baseSchemas.ts:353`（schema-literal）

### `Branch`（A，message，3 处）

- 显示位置（照常转换）：`apps/web/src/components/DiffPanel.tsx:838`（A，DiffPanel）；`apps/web/src/components/GitActionsControl.tsx:1948`（A，GitActionsControl）；`apps/web/src/components/chat/WorktreeSetupCard.tsx:262`（A，SetupDetails）
- 同一文本作为值用途字面量出现 1 次：`apps/web/src/components/chat/SubagentTooltipContent.tsx:174`（comparison）

### `Delete`（A，message，3 处）

- 显示位置（照常转换）：`apps/web/src/components/projectScriptEditor.tsx:484`（A，ProjectScriptEditorDialog）；`apps/web/src/components/settings/AcpSessionManagementSection.tsx:417`（A，AcpSessionManagementSection）；`apps/web/src/components/settings/ScheduledTasksSettings.tsx:509`（A，ScheduledTaskRow）
- 同一文本作为值用途字面量出现 9 次：`apps/desktop/src/preview/RecordingInput.ts:32`（object-key）；`apps/web/src/browser/ServerBrowserSurface.tsx:65`（as-const）；`apps/web/src/browser/ServerBrowserSurface.tsx:65`（as-const）；`apps/web/src/browser/ServerBrowserSurface.tsx:716`（comparison）；`apps/web/src/components/projectScriptEditor.tsx:233`（comparison）；`apps/web/src/composer-rich-text-doc.ts:240`（object-key）；`apps/web/src/terminal/ghostty/keyCodes.ts:73`（as-const）；`packages/client-runtime/src/device/stream.ts:304`（object-key）；`packages/client-runtime/src/device/stream.ts:334`（object-key）

### `Enter`（A，message，3 处）

- 显示位置（照常转换）：`apps/web/src/components/CommandPalette.tsx:3432`（A，OpenCommandPaletteDialog）；`apps/web/src/components/CommandPalette.tsx:3473`（A，OpenCommandPaletteDialog）；`apps/web/src/components/CommandPaletteContent.tsx:80`（A，CommandPaletteContent）
- 同一文本作为值用途字面量出现 59 次：`apps/desktop/src/preview/AnnotationKeyboard.ts:15`（comparison）；`apps/desktop/src/preview/RecordingInput.ts:29`（object-key）；`apps/web/src/browser/ServerBrowserSurface.tsx:700`（comparison）；`apps/web/src/components/BranchPicker.tsx:183`（comparison）；`apps/web/src/components/ChatMarkdown.tsx:1348`（comparison）；`apps/web/src/components/CommandPalette.tsx:3165`（comparison）；`apps/web/src/components/CommandPalette.tsx:3175`（comparison）；`apps/web/src/components/CommandPalette.tsx:3190`（comparison）；`apps/web/src/components/CommandPalette.tsx:3232`（comparison）；`apps/web/src/components/ComposerPromptEditorTiptap.tsx:1312`（comparison）；…（共 59 处）

### `Host`（B，message，3 处）

- 显示位置（照常转换）：`apps/web/src/components/pullRequest/PullRequestListFilters.tsx:567`（B，PullRequestFiltersMenu）；`apps/web/src/components/settings/ConnectionsSettings.tsx:2938`（A，renderRemoteFields）；`apps/web/src/components/settings/GitHubTokenSettings.tsx:95`（A，GitHubTokenSettings）
- 同一文本作为值用途字面量出现 1 次：`apps/web/src/components/chat/ComposerSurface.tsx:101`（object-key）

### `Nightly`（A，message，3 处）

- 显示位置（照常转换）：`apps/web/src/components/settings/SettingsPanels.tsx:470`（A，AboutVersionSection）；`apps/web/src/components/settings/SettingsPanels.tsx:478`（A，AboutVersionSection）；`apps/web/src/components/settings/SettingsPanels.tsx:506`（A，AboutVersionSection）
- 同一文本作为值用途字面量出现 3 次：`apps/web/src/components/SidebarStageBackdrop.tsx:9`（ts-type）；`packages/contracts/src/ipc.ts:84`（ts-type）；`packages/contracts/src/ipc.ts:99`（schema-literal）

### `Process`（A，message，3 处）

- 显示位置（照常转换）：`apps/web/src/components/settings/DiagnosticsSettings.tsx:594`（A，ProcessResourceHistoryTable）；`apps/web/src/components/settings/ResourceTelemetryDiagnostics.tsx:588`（A，ProcessTable）；`apps/web/src/components/settings/ResourceTelemetryDiagnostics.tsx:692`（A，HistoryProcessTable）
- 同一文本作为值用途字面量出现 3 次：`apps/desktop/src/preview/RecordingInput.ts:21`（membership）；`apps/web/src/browser/ServerBrowserSurface.tsx:678`（comparison）；`apps/web/src/terminal/ghostty/surface.ts:421`（comparison）

### `Project`（B，message，3 处）

- 显示位置（照常转换）：`apps/web/src/components/pullRequest/PullRequestListFilters.tsx:589`（B，PullRequestFiltersMenu）；`apps/web/src/components/settings/ProjectSettingsPanel.tsx:458`（B，ProjectDetail）；`apps/web/src/components/settings/ScheduledTasksSettings.tsx:1046`（B，ScheduledTaskEditorDialog）
- 同一文本作为值用途字面量出现 1 次：`apps/web/src/components/settings/KeybindingsSettings.logic.ts:48`（ts-type）

### `Settled`（B，message，3 处）

- 显示位置（照常转换）：`apps/web/src/components/ChatView.tsx:7531`（B，threadStatusLine）；`apps/web/src/components/Sidebar.tsx:5504`（B，Sidebar）；`apps/web/src/components/Sidebar.tsx:5521`（B，Sidebar）
- 同一文本作为值用途字面量出现 1 次：`apps/web/src/hooks/showThreadUndoNotice.ts:12`（ts-type）

### `value`（B，message，3 处）

- 显示位置（照常转换）：`apps/web/src/components/settings/CustomModelEditor.tsx:156`（B，renderChoice）；`apps/web/src/components/settings/ProviderInstanceCard.tsx:439`（B，ProviderEnvironmentSection）；`apps/web/src/components/settings/ProviderInstanceCard.tsx:452`（B，ProviderEnvironmentSection）
- 同一文本作为值用途字面量出现 861 次：`apps/desktop/src/app/DesktopObservability.ts:114`（object-key）；`apps/desktop/src/app/DesktopObservability.ts:250`（object-key）；`apps/desktop/src/app/DesktopObservability.ts:256`（object-key）；`apps/desktop/src/app/chromiumLocalStorage.ts:269`（object-key）；`apps/desktop/src/app/chromiumLocalStorage.ts:293`（object-key）；`apps/desktop/src/app/chromiumLocalStorage.ts:295`（object-key）；`apps/desktop/src/app/chromiumLocalStorage.ts:353`（object-key）；`apps/desktop/src/preview/BrowserImport/BrowserImport.ts:130`（object-key）；`apps/desktop/src/preview/BrowserImport/ChromiumCookies.ts:82`（object-key）；`apps/desktop/src/preview/BrowserImport/ChromiumCookies.ts:98`（object-key）；…（共 861 处）

### `Active`（B，message，2 处）

- 显示位置（照常转换）：`apps/web/src/components/Sidebar.tsx:5434`（B，Sidebar）；`apps/web/src/components/Sidebar.tsx:5445`（B，Sidebar）
- 同一文本作为值用途字面量出现 5 次：`apps/desktop/src/backend/DesktopBackendPool.ts:189`（ts-type）；`apps/desktop/src/backend/DesktopBackendPool.ts:339`（comparison）；`apps/desktop/src/backend/DesktopBackendPool.ts:440`（comparison）；`apps/desktop/src/backend/DesktopBackendPool.ts:446`（comparison）；`apps/web/src/components/settings/ResourceTelemetryDiagnostics.tsx:1134`（never-attribute）

### `Backspace`（A，message，2 处）

- 显示位置（照常转换）：`apps/web/src/components/CommandPaletteContent.tsx:86`（A，CommandPaletteContent）；`apps/web/src/components/projectScriptEditor.tsx:408`（A，ProjectScriptEditorDialog）
- 同一文本作为值用途字面量出现 12 次：`apps/desktop/src/preview/RecordingInput.ts:31`（object-key）；`apps/web/src/browser/ServerBrowserSurface.tsx:64`（as-const）；`apps/web/src/browser/ServerBrowserSurface.tsx:64`（as-const）；`apps/web/src/browser/ServerBrowserSurface.tsx:716`（comparison）；`apps/web/src/components/CommandPalette.tsx:3203`（comparison）；`apps/web/src/components/chat/ComposerStashMenu.tsx:104`（comparison）；`apps/web/src/components/projectScriptEditor.tsx:233`（comparison）；`apps/web/src/composer-rich-text-doc.ts:158`（object-key）；`apps/web/src/composer-rich-text-doc.ts:239`（object-key）；`apps/web/src/terminal/ghostty/keyCodes.ts:58`（as-const）；…（共 12 处）

### `Browser`（B，message，2 处）

- 显示位置（照常转换）：`apps/web/src/components/settings/IntegrationsSettings.tsx:1569`（B，IntegrationsSettingsPanel）；`apps/web/src/components/settings/ProjectDefaultsSettings.tsx:271`（B，ProjectDefaultsSettings）
- 同一文本作为值用途字面量出现 6 次：`apps/server/src/provider/CodexToolPresentation.ts:190`（comparison）；`apps/server/src/resourceTelemetry/Model.ts:106`（switch-case）；`apps/web/src/components/RightPanelTabs.tsx:535`（comparison）；`apps/web/src/components/RightPanelTabs.tsx:547`（comparison）；`apps/web/src/components/RightPanelTabs.tsx:1356`（comparison）；`packages/contracts/src/resourceTelemetry.ts:232`（schema-literal）

### `Connect`（A，message，2 处）

- 显示位置（照常转换）：`apps/web/src/components/settings/CodexSetupSection.tsx:695`（A，ManagedCodexSetup）；`apps/web/src/components/settings/ProviderAuthenticationSection.tsx:422`（A，ProviderAuthenticationSection）
- 同一文本作为值用途字面量出现 1 次：`apps/web/src/components/onboarding/WelcomeWizard.tsx:116`（as-const）

### `Custom`（A，message，2 处）

- 显示位置（照常转换）：`apps/web/src/components/settings/StorageSettings.tsx:504`（A，StorageSettingsPanel）；`apps/web/src/components/settings/StorageSettings.tsx:510`（A，StorageSettingsPanel）
- 同一文本作为值用途字面量出现 2 次：`apps/web/src/components/settings/KeybindingsSettings.logic.ts:48`（ts-type）；`apps/web/src/components/settings/KeybindingsSettings.tsx:900`（comparison）

### `Devices`（B，message，2 处）

- 显示位置（照常转换）：`apps/web/src/components/settings/IntegrationsSettings.tsx:661`（B，DeviceIntegrationSettings）；`apps/web/src/components/settings/ProviderSettingsPanel.tsx:382`（B，ProviderSettingsPanelContent）
- 同一文本作为值用途字面量出现 1 次：`apps/web/src/components/device/DevicePanel.tsx:217`（never-attribute）

### `Disabled`（A，message，2 处）

- 显示位置（照常转换）：`apps/web/src/components/onboarding/WelcomeWizard.tsx:1002`（A，AgentCard）；`apps/web/src/components/settings/AcpSessionManagementSection.tsx:509`（A，AcpSessionManagementSection）
- 同一文本作为值用途字面量出现 1 次：`apps/web/src/components/settings/ResourceTelemetryDiagnostics.tsx:1127`（never-attribute）

### `Failed`（A，message，2 处）

- 显示位置（照常转换）：`apps/web/src/components/chat/ThreadLineageWorkflowRow.tsx:214`（A，ThreadLineageWorkflowRow）；`apps/web/src/components/settings/DeviceHostEditor.tsx:184`（A，DeviceHostEditor）
- 同一文本作为值用途字面量出现 16 次：`apps/desktop/src/backend/DesktopBackendConfiguration.ts:304`（ts-type）；`apps/desktop/src/backend/DesktopBackendConfiguration.ts:349`（as-const）；`apps/desktop/src/backend/DesktopBackendConfiguration.ts:361`（as-const）；`apps/desktop/src/backend/DesktopBackendConfiguration.ts:375`（as-const）；`apps/desktop/src/backend/DesktopBackendConfiguration.ts:391`（as-const）；`apps/desktop/src/backend/DesktopBackendConfiguration.ts:434`（as-const）；`apps/desktop/src/backend/DesktopBackendConfiguration.ts:473`（as-const）；`apps/desktop/src/backend/DesktopBackendConfiguration.ts:791`（comparison）；`apps/web/src/components/pullRequest/PullRequestGuideTab.tsx:113`（comparison）；`apps/web/src/components/pullRequest/guide/PullRequestGuideRunCoordinator.tsx:57`（comparison）；…（共 16 处）

### `Files`（A，message，2 处）

- 显示位置（照常转换）：`apps/web/src/components/GitActionsControl.tsx:1970`（A，GitActionsControl）；`apps/web/src/components/diffs/DiffFileTree.tsx:173`（A，DiffFileTree）
- 同一文本作为值用途字面量出现 1 次：`apps/web/src/components/chat/workspaceFileDrop.ts:26`（membership）

### `Local ACP command`（A，message，2 处）

- 显示位置（照常转换）：`apps/web/src/components/settings/AcpRegistrySearchStep.tsx:186`（A，AcpRegistrySearchStep）；`apps/web/src/components/settings/AddProviderInstanceDialog.tsx:477`（A，AddProviderInstanceDialog）
- 同一文本作为值用途字面量出现 1 次：`apps/web/src/components/settings/AddProviderInstanceDialog.tsx:190`（as-const）

### `New thread`（A，message，2 处）

- 显示位置（照常转换）：`apps/web/src/components/LegacySidebar.tsx:2538`（A，SidebarProjectItem）；`apps/web/src/components/sidebar/SidebarThreadHeader.tsx:136`（B，SidebarThreadHeader）
- 同一文本作为值用途字面量出现 1 次：`apps/server/src/orchestration-v2/ThreadTitleRegenerationService.ts:123`（comparison）

### `Provider`（A，message，2 处）

- 显示位置（照常转换）：`apps/web/src/components/GitActionsControl.tsx:670`（A，PublishRepositoryDialog）；`apps/web/src/components/settings/AddProviderInstanceDialog.tsx:418`（A，AddProviderInstanceDialog）
- 同一文本作为值用途字面量出现 4 次：`apps/web/src/components/GitActionsControl.tsx:559`（as-const）；`apps/web/src/components/settings/AddProviderInstanceDialog.logic.ts:8`（as-const）；`apps/web/src/components/settings/AddProviderInstanceDialog.logic.ts:9`（as-const）；`apps/web/src/components/settings/AddProviderInstanceDialog.logic.ts:10`（as-const）

### `Read`（B，message，2 处）

- 显示位置（照常转换）：`apps/web/src/components/settings/ResourceTelemetryDiagnostics.tsx:286`（B，AggregateCard）；`apps/web/src/components/settings/ResourceTelemetryDiagnostics.tsx:697`（A，HistoryProcessTable）
- 同一文本作为值用途字面量出现 1 次：`apps/server/src/orchestration-v2/Adapters/ClaudeAdapterV2.ts:376`（as-const）

### `Repository`（A，message，2 处）

- 显示位置（照常转换）：`apps/web/src/components/CommandPalette.tsx:3586`（A，OpenCommandPaletteDialog）；`apps/web/src/components/GitActionsControl.tsx:747`（A，PublishRepositoryDialog）
- 同一文本作为值用途字面量出现 4 次：`apps/server/src/project/AgentSessionScanner.ts:700`（ts-type）；`apps/server/src/project/AgentSessionScanner.ts:722`（as-const）；`apps/server/src/project/AgentSessionScanner.ts:1245`（comparison）；`apps/web/src/components/GitActionsControl.tsx:559`（as-const）

### `Skill`（A，message，2 处）

- 显示位置（照常转换）：`apps/web/src/components/chat/ComposerCommandMenu.tsx:271`（A，SkillSourceBadge）；`apps/web/src/components/chat/MessagesTimeline.tsx:4633`（B，userMessageContextPresentationRegistry）
- 同一文本作为值用途字面量出现 1 次：`packages/shared/src/toolActivity.ts:22`（comparison）

### `Snoozed`（B，message，2 处）

- 显示位置（照常转换）：`apps/web/src/components/ChatView.tsx:7519`（B，threadStatusLine）；`apps/web/src/components/Sidebar.tsx:5484`（B，Sidebar）
- 同一文本作为值用途字面量出现 1 次：`apps/web/src/hooks/showThreadUndoNotice.ts:12`（ts-type）

### `Stop`（A，message，2 处）

- 显示位置（照常转换）：`apps/web/src/components/ChatView.tsx:7492`（A，backgroundWorkBannerItem）；`apps/web/src/components/preview/PreviewChromeRow.tsx:164`（B，PreviewChromeRow）
- 同一文本作为值用途字面量出现 2 次：`packages/effect-codex-app-server/src/_generated/schema.gen.ts:52065`（object-key）；`packages/effect-codex-app-server/src/_generated/schema.gen.ts:52089`（object-key）

### `T3 Code`（A，message，2 处）

- 显示位置（照常转换）：`apps/web/src/components/chat/MessagesTimeline.tsx:2884`（A，AssistantTimelineRow）；`apps/web/src/components/onboarding/WelcomeWizard.tsx:238`（B，WelcomeWizard）
- 同一文本作为值用途字面量出现 1 次：`apps/server/src/cloud/cliAuthHtml.ts:12`（as-const）

### `Version`（B，message，2 处）

- 显示位置（照常转换）：`apps/web/src/components/settings/ConnectionsSettings.tsx:3668`（B，ConnectionsSettings）；`apps/web/src/components/settings/SettingsPanels.tsx:275`（A，AboutVersionTitle）
- 同一文本作为值用途字面量出现 3 次：`apps/desktop/src/snapShot/LinuxSnapShot.ts:55`（object-key）；`apps/desktop/src/snapShot/LinuxSnapShot.ts:56`（object-key）；`apps/desktop/src/snapShot/NiriSnapShot.ts:45`（object-key）

### `Working`（A，message，2 处）

- 显示位置（照常转换）：`apps/web/src/components/CommandPalette.tsx:3430`（A，OpenCommandPaletteDialog）；`apps/web/src/components/Sidebar.tsx:5466`（B，Sidebar）
- 同一文本作为值用途字面量出现 2 次：`apps/web/src/components/Sidebar.logic.ts:628`（ts-type）；`apps/web/src/components/Sidebar.logic.ts:643`（object-key）

### `comment`（A，message，2 处）

- 显示位置（照常转换）：`apps/web/src/components/pullRequest/PullRequestReviewAnnotation.tsx:253`（A，ReviewThreadCard）；`apps/web/src/components/pullRequest/PullRequestTimelineTab.tsx:329`（A，ConversationGroup）
- 同一文本作为值用途字面量出现 111 次：`apps/desktop/src/preview/PickPreload.ts:1434`（object-key）；`apps/desktop/src/preview/PickedElementPayload.ts:76`（computed-key）；`apps/server/src/pullRequest/PullRequestService.ts:295`（object-key）；`apps/server/src/pullRequest/PullRequestService.ts:332`（object-key）；`apps/server/src/pullRequest/PullRequestService.ts:683`（object-key）；`apps/server/src/pullRequest/PullRequestService.ts:2184`（ts-type）；`apps/server/src/pullRequest/PullRequestService.ts:2190`（error-constructor）；`apps/server/src/pullRequest/PullRequestService.ts:2200`（error-constructor）；`apps/server/src/pullRequest/PullRequestService.ts:2210`（error-constructor）；`apps/server/src/pullRequest/PullRequestService.ts:3614`（object-key）；…（共 111 处）

### `comments`（A，message，2 处）

- 显示位置（照常转换）：`apps/web/src/components/pullRequest/PullRequestReviewAnnotation.tsx:253`（A，ReviewThreadCard）；`apps/web/src/components/pullRequest/PullRequestTimelineTab.tsx:329`（A，ConversationGroup）
- 同一文本作为值用途字面量出现 84 次：`apps/server/src/orchestration-v2/PullRequestWatchReactor.ts:292`（object-key）；`apps/server/src/orchestration-v2/PullRequestWatchReactor.ts:381`（object-key）；`apps/server/src/pullRequest/PullRequestService.ts:1896`（object-key）；`apps/server/src/pullRequest/PullRequestService.ts:2345`（object-key）；`apps/web/src/components/chat/ThreadDetailsPrRow.tsx:207`（object-key）；`apps/web/src/components/pullRequest/PullRequestDetailPanel.tsx:766`（object-key）；`apps/web/src/components/pullRequest/PullRequestDetailPanel.tsx:1517`（object-key）；`apps/web/src/components/pullRequest/PullRequestReviewAnnotation.tsx:183`（object-key）；`apps/web/src/components/pullRequest/PullRequestReviewAnnotation.tsx:224`（object-key）；`apps/web/src/components/pullRequest/PullRequestReviewForm.tsx:98`（object-key）；…（共 84 处）

### `default`（A，message，2 处）

- 显示位置（照常转换）：`apps/web/src/components/settings/EnvironmentIconPicker.tsx:98`（A，EnvironmentIconMenu）；`apps/web/src/components/settings/FontFamilyPicker.tsx:187`（A，renderItem）
- 同一文本作为值用途字面量出现 519 次：`apps/desktop/src/ipc/methods/window.ts:171`（comparison）；`apps/desktop/src/snapShot/RegionSnapShotWorker.ts:9`（object-key）；`apps/server/src/device/DeviceActions.ts:103`（object-key）；`apps/server/src/device/DeviceActions.ts:109`（object-key）；`apps/server/src/mcp/OrchestratorMcpService.ts:1014`（as-const）；`apps/server/src/mcp/threadAccess.ts:145`（comparison）；`apps/server/src/orchestration-v2/DispatchModeLimit.ts:41`（object-key）；`apps/server/src/provider/CodexMcpElicitation.ts:37`（object-key）；`apps/web/src/components/ChatView.tsx:713`（object-key）；`apps/web/src/components/ChatView.tsx:719`（object-key）；…（共 519 处）

### `file`（A，message，2 处）

- 显示位置（照常转换）：`apps/web/src/components/chat/ThreadDetailsPrRow.tsx:297`（A，ThreadDetailsPrRow）；`apps/web/src/components/pullRequest/PullRequestCodeTab.tsx:1151`（A，PullRequestCodeTab）
- 同一文本作为值用途字面量出现 203 次：`apps/desktop/src/permissions/MacPermissionHelper.ts:143`（object-key）；`apps/server/src/assets/AssetAccess.ts:181`（ts-type）；`apps/server/src/assets/AssetAccess.ts:186`（object-key）；`apps/server/src/assets/AssetAccess.ts:970`（object-key）；`apps/server/src/assets/AttachmentUpload.ts:45`（schema-literal）；`apps/server/src/assets/AttachmentUpload.ts:98`（comparison）；`apps/server/src/assets/AttachmentUpload.ts:164`（comparison）；`apps/server/src/attachmentStore.ts:164`（switch-case）；`apps/server/src/http.ts:173`（object-key）；`apps/server/src/http.ts:515`（object-key）；…（共 203 处）

### `files`（A，message，2 处）

- 显示位置（照常转换）：`apps/web/src/components/chat/ThreadDetailsPrRow.tsx:297`（A，ThreadDetailsPrRow）；`apps/web/src/components/pullRequest/PullRequestCodeTab.tsx:1151`（A，PullRequestCodeTab）
- 同一文本作为值用途字面量出现 216 次：`apps/desktop/src/snapShot/CaptureShortcutConfig.ts:98`（object-key）；`apps/desktop/src/snapShot/CaptureShortcutConfig.ts:210`（object-key）；`apps/desktop/src/snapShot/CaptureShortcutConfig.ts:225`（object-key）；`apps/server/src/git/GitManager.ts:1092`（object-key）；`apps/server/src/git/GitWorkflowService.ts:138`（object-key）；`apps/server/src/orchestration-v2/CheckpointCaptureService.ts:283`（object-key）；`apps/server/src/orchestration-v2/CheckpointService.ts:227`（object-key）；`apps/server/src/orchestration-v2/CheckpointService.ts:227`（ts-type）；`apps/server/src/orchestration-v2/CheckpointService.ts:241`（object-key）；`apps/server/src/orchestration-v2/CheckpointService.ts:343`（object-key）；…（共 216 处）

### `iOS`（A，message，2 处）

- 显示位置（照常转换）：`apps/web/src/components/RightPanelTabs.tsx:1519`（A，DeviceTabTooltip）；`apps/web/src/components/device/DeviceHostAvailability.tsx:16`（A，DeviceHostAvailability）
- 同一文本作为值用途字面量出现 2 次：`apps/server/src/ws.ts:678`（comparison）；`packages/contracts/src/baseSchemas.ts:352`（schema-literal）

### `on`（A，message，2 处）

- 显示位置（照常转换）：`apps/web/src/components/settings/ScheduledTasksSettings.tsx:1309`（A，ScheduledTaskEditorDialog）；`apps/web/src/components/settings/SettingsScopeSentence.tsx:75`（A，SettingsScopeSentence）
- 同一文本作为值用途字面量出现 25 次：`apps/desktop/src/app/DesktopLifecycle.ts:69`（object-key）；`apps/desktop/src/electron/ElectronApp.ts:79`（object-key）；`apps/desktop/src/electron/ElectronApp.ts:208`（object-key）；`apps/desktop/src/electron/ElectronUpdater.ts:76`（object-key）；`apps/desktop/src/electron/ElectronUpdater.ts:154`（object-key）；`apps/desktop/src/electron/ElectronUpdater.ts:156`（object-key）；`apps/desktop/src/ipc/DesktopIpc.ts:26`（object-key）；`apps/desktop/src/snapShot/snapShot.ts:134`（ts-type）；`apps/desktop/src/snapShot/snapShot.ts:234`（comparison）；`apps/desktop/src/updates/updatesTestHarness.ts:102`（object-key）；…（共 25 处）

### `Add ChatGPT account`（B，message，1 处）

- 显示位置（照常转换）：`apps/web/src/components/settings/AddCodexAccountDialog.tsx:94`（B，AddCodexAccountDialog）
- 同一文本作为值用途字面量出现 1 次：`apps/web/src/components/settings/AddCodexAccountDialog.tsx:39`（non-display-call）

### `Alt`（A，message，1 处）

- 显示位置（照常转换）：`apps/web/src/components/settings/KeybindingsSettings.tsx:101`（A，KeybindingPill）
- 同一文本作为值用途字面量出现 6 次：`apps/desktop/src/preview/RecordingInput.ts:24`（comparison）；`apps/desktop/src/preview/RecordingInput.ts:41`（membership）；`apps/web/src/components/ComposerPromptEditorTiptap.tsx:1851`（comparison）；`apps/web/src/components/settings/useSnapShotShortcutRecorder.tsx:23`（object-key）；`apps/web/src/shortcutModifierState.ts:86`（switch-case）；`packages/contracts/src/previewAutomation.ts:572`（schema-literal）

### `Any`（A，message，1 处）

- 显示位置（照常转换）：`apps/web/src/components/pullRequest/PullRequestListFilters.tsx:351`（A，PullRequestLabelFilter）
- 同一文本作为值用途字面量出现 1 次：`apps/server/src/project/AgentSessionJson.ts:34`（switch-case）

### `App`（B，message，1 处）

- 显示位置（照常转换）：`apps/web/src/components/device/DeviceToolsPanel.tsx:134`（B，DeviceToolsPanel）
- 同一文本作为值用途字面量出现 6 次：`apps/desktop/src/electron/WindowsForegroundFocusWorker.ts:29`（ts-type）；`apps/desktop/src/electron/WindowsForegroundFocusWorker.ts:47`（ts-type）；`apps/desktop/src/electron/WindowsForegroundFocusWorker.ts:60`（ts-type）；`apps/desktop/src/electron/WindowsForegroundFocusWorker.ts:79`（object-key）；`apps/desktop/src/snapShot/SnapShotAccessibility.ts:39`（ts-type）；`apps/desktop/src/snapShot/SnapShotAccessibilityWorker.ts:9`（object-key）

### `Attachment`（A，message，1 处）

- 显示位置（照常转换）：`apps/web/src/components/files/AttachmentFilePreview.tsx:295`（A，AttachmentFilePreview）
- 同一文本作为值用途字面量出现 1 次：`apps/web/src/components/chat/ComposerBanner.tsx:353`（object-key）

### `Body`（B，message，1 处）

- 显示位置（照常转换）：`apps/web/src/components/settings/ScheduledTasksSettings.tsx:601`（B，WebhookDeliveriesDialog）
- 同一文本作为值用途字面量出现 1 次：`apps/web/src/components/chat/ComposerBanner.tsx:365`（object-key）

### `Commit`（A，message，1 处）

- 显示位置（照常转换）：`apps/web/src/components/GitActionsControl.tsx:2099`（A，GitActionsControl）
- 同一文本作为值用途字面量出现 1 次：`apps/web/src/components/GitActionsControl.tsx:324`（comparison）

### `Copy`（A，message，1 处）

- 显示位置（照常转换）：`apps/web/src/components/settings/ScheduledTasksSettings.tsx:733`（A，WebhookEndpointField）
- 同一文本作为值用途字面量出现 1 次：`apps/web/src/terminal/ghostty/keyCodes.ts:178`（as-const）

### `Count`（A，message，1 处）

- 显示位置（照常转换）：`apps/web/src/components/settings/ResourceTelemetryDiagnostics.tsx:778`（A，AttributionTable）
- 同一文本作为值用途字面量出现 1 次：`apps/web/src/components/chat/ComposerBanner.tsx:364`（object-key）

### `Cursor`（A，message，1 处）

- 显示位置（照常转换）：`apps/web/src/components/usage/UsagePage.tsx:1124`（A，CursorEnableLimits）
- 同一文本作为值用途字面量出现 2 次：`packages/provider-cursor/src/server/sdk.ts:11`（object-key）；`packages/provider-cursor/src/server/status.ts:27`（as-const）

### `Desktop`（B，message，1 处）

- 显示位置（照常转换）：`apps/web/src/components/settings/ResourceTelemetryDiagnostics.tsx:1080`（B，ResourceTelemetryDiagnostics）
- 同一文本作为值用途字面量出现 1 次：`packages/shared/src/previewViewport.ts:11`（ts-type）

### `Device hub`（B，message，1 处）

- 显示位置（照常转换）：`apps/web/src/components/settings/IntegrationsSettings.tsx:832`（B，DeviceIntegrationControls）
- 同一文本作为值用途字面量出现 2 次：`apps/web/src/components/device/DeviceToolVersions.tsx:54`（as-const）；`packages/client-runtime/src/state/device.ts:79`（as-const）

### `Enabled`（A，message，1 处）

- 显示位置（照常转换）：`apps/web/src/components/settings/ScheduledTasksSettings.tsx:1354`（A，ScheduledTaskEditorDialog）
- 同一文本作为值用途字面量出现 1 次：`apps/web/src/components/settings/ResourceTelemetryDiagnostics.tsx:1126`（never-attribute）

### `Encoding`（B，message，1 处）

- 显示位置（照常转换）：`apps/web/src/components/settings/ScheduledTasksSettings.tsx:1254`（B，ScheduledTaskEditorDialog）
- 同一文本作为值用途字面量出现 8 次：`apps/server/src/persistence/Errors.ts:8`（switch-case）；`packages/effect-acp/src/errors.ts:22`（schema-literal）；`packages/effect-acp/src/errors.ts:85`（switch-case）；`packages/effect-acp/src/errors.ts:120`（switch-case）；`packages/effect-codex-app-server/src/errors.ts:14`（schema-literal）；`packages/effect-codex-app-server/src/errors.ts:44`（switch-case）；`packages/shared/src/schemaJson.ts:57`（switch-case）；`packages/shared/src/schemaJson.ts:78`（switch-case）

### `Environment disconnected`（B，message，1 处）

- 显示位置（照常转换）：`apps/web/src/components/settings/ScheduledTasksSettings.tsx:366`（B，ScheduledTaskEnvironmentSection）
- 同一文本作为值用途字面量出现 3 次：`apps/web/src/components/settings/DeviceHostsSettings.tsx:46`（error-constructor）；`apps/web/src/components/settings/IntegrationsSettings.tsx:720`（error-constructor）；`apps/web/src/components/settings/deviceHostConnectionChecks.ts:49`（error-constructor）

### `Filter`（A，message，1 处）

- 显示位置（照常转换）：`apps/web/src/components/pullRequest/PullRequestSummaryTab.tsx:881`（A，PullRequestSummaryTab）
- 同一文本作为值用途字面量出现 8 次：`apps/server/src/persistence/Errors.ts:7`（switch-case）；`packages/effect-acp/src/errors.ts:21`（schema-literal）；`packages/effect-acp/src/errors.ts:84`（switch-case）；`packages/effect-acp/src/errors.ts:119`（switch-case）；`packages/effect-codex-app-server/src/errors.ts:13`（schema-literal）；`packages/effect-codex-app-server/src/errors.ts:43`（switch-case）；`packages/shared/src/schemaJson.ts:55`（switch-case）；`packages/shared/src/schemaJson.ts:80`（switch-case）

### `HEAD`（A，message，1 处）

- 显示位置（照常转换）：`apps/web/src/components/DiffPanel.tsx:798`（A，DiffPanel）
- 同一文本作为值用途字面量出现 17 次：`apps/desktop/src/electron/ElectronProtocol.ts:205`（comparison）；`apps/desktop/src/electron/ElectronProtocol.ts:210`（comparison）；`apps/desktop/src/electron/ElectronProtocol.ts:227`（comparison）；`apps/desktop/src/electron/ElectronProtocol.ts:250`（comparison）；`apps/server/src/device/DeviceHubProxy.ts:129`（comparison）；`apps/server/src/device/DeviceHubProxy.ts:164`（comparison）；`apps/server/src/http.ts:178`（ts-type）；`apps/server/src/http.ts:194`（comparison）；`apps/server/src/http.ts:242`（comparison）；`apps/server/src/http.ts:464`（comparison）；…（共 17 处）

### `Home`（B，message，1 处）

- 显示位置（照常转换）：`apps/web/src/components/device/DeviceControlsRail.tsx:65`（B，DeviceControlsRail）
- 同一文本作为值用途字面量出现 15 次：`apps/web/src/components/ChatView.tsx:6487`（membership）；`apps/web/src/components/ChatView.tsx:6489`（membership）；`apps/web/src/components/ChatView.tsx:6497`（switch-case）；`apps/web/src/components/ComposerPromptEditorTiptap.tsx:1205`（comparison）；`apps/web/src/components/ComposerPromptEditorTiptap.tsx:1221`（comparison）；`apps/web/src/components/chat/MessagesTimeline.tsx:990`（membership）；`apps/web/src/components/chat/MessagesTimeline.tsx:1956`（comparison）；`apps/web/src/components/chat/composerScrollGesture.ts:16`（switch-case）；`apps/web/src/components/chat/useAssistantCitationTarget.ts:158`（membership）；`apps/web/src/components/ui/color-picker.tsx:101`（switch-case）；…（共 15 处）

### `Icon`（A，message，1 处）

- 显示位置（照常转换）：`apps/web/src/components/settings/EnvironmentIconPicker.tsx:71`（A，EnvironmentIconMenu）
- 同一文本作为值用途字面量出现 110 次：`apps/web/src/components/ChatMarkdown.tsx:411`（object-key）；`apps/web/src/components/ChatMarkdown.tsx:415`（object-key）；`apps/web/src/components/ChatMarkdown.tsx:421`（object-key）；`apps/web/src/components/ChatMarkdown.tsx:427`（object-key）；`apps/web/src/components/ChatMarkdown.tsx:433`（object-key）；`apps/web/src/components/ChatMarkdown.tsx:439`（object-key）；`apps/web/src/components/GitActionsControl.tsx:191`（object-key）；`apps/web/src/components/GitActionsControl.tsx:299`（ts-type）；`apps/web/src/components/GitActionsControl.tsx:313`（ts-type）；`apps/web/src/components/GitActionsControl.tsx:795`（object-key）；…（共 110 处）

### `Idle`（B，message，1 处）

- 显示位置（照常转换）：`apps/web/src/components/settings/ResourceTelemetryDiagnostics.tsx:1131`（B，ResourceTelemetryDiagnostics）
- 同一文本作为值用途字面量出现 25 次：`apps/desktop/src/preview/Manager.ts:88`（ts-type）；`apps/desktop/src/preview/Manager.ts:1300`（comparison）；`apps/desktop/src/preview/Manager.ts:2018`（comparison）；`apps/server/src/preview/Manager.ts:267`（comparison）；`apps/web/src/browser/ElectronBrowserHost.tsx:130`（comparison）；`apps/web/src/components/RightPanelTabs.tsx:625`（comparison）；`apps/web/src/components/RightPanelTabs.tsx:673`（comparison）；`apps/web/src/components/preview/PreviewView.tsx:230`（as-const）；`apps/web/src/components/preview/PreviewView.tsx:231`（comparison）；`apps/web/src/components/preview/PreviewView.tsx:235`（comparison）；…（共 25 处）

### `Interrupt`（A，message，1 处）

- 显示位置（照常转换）：`apps/web/src/components/chat/ComposerPrimaryActions.tsx:157`（A，renderStopGenerationButton）
- 同一文本作为值用途字面量出现 5 次：`packages/effect-acp/src/protocol.ts:264`（comparison）；`packages/effect-acp/src/protocol.ts:680`（switch-case）；`packages/effect-codex-app-server/src/_generated/schema.gen.ts:52057`（object-key）；`packages/effect-codex-app-server/src/_generated/schema.gen.ts:52073`（object-key）；`packages/shared/src/schemaJson.ts:139`（switch-case）

### `Mode`（A，message，1 处）

- 显示位置（照常转换）：`apps/web/src/components/chat/CompactComposerControlsMenu.tsx:64`（A，CompactComposerControlsMenu）
- 同一文本作为值用途字面量出现 1 次：`packages/shared/src/qrCode.ts:763`（object-key）

### `Path`（A，message，1 处）

- 显示位置（照常转换）：`apps/web/src/components/chat/WorktreeSetupCard.tsx:278`（A，SetupDetails）
- 同一文本作为值用途字面量出现 3 次：`apps/server/src/cli/update.ts:197`（computed-key）；`apps/server/src/process/externalLauncher.ts:135`（object-key）；`packages/provider-core/src/server/maintenanceResolver.ts:61`（object-key）

### `Projects`（A，message，1 处）

- 显示位置（照常转换）：`apps/web/src/components/LegacySidebar.tsx:3100`（A，SidebarProjectsContent）
- 同一文本作为值用途字面量出现 1 次：`apps/web/src/components/onboarding/WelcomeWizard.tsx:116`（as-const）

### `Remove route`（A，message，1 处）

- 显示位置（照常转换）：`apps/web/src/components/settings/EnvironmentRoutesList.tsx:217`（A，SortableRouteRow）
- 同一文本作为值用途字面量出现 1 次：`apps/web/src/components/settings/EnvironmentRoutesList.tsx:71`（non-display-call）

### `Running`（A，message，1 处）

- 显示位置（照常转换）：`apps/web/src/components/device/DeviceToolVersions.tsx:63`（A，DeviceToolVersions）
- 同一文本作为值用途字面量出现 4 次：`apps/server/src/pullRequest/PullRequestReviewGuideService.ts:498`（comparison）；`apps/web/src/components/pullRequest/guide/PullRequestGuideRunCoordinator.tsx:52`（comparison）；`apps/web/src/components/pullRequest/guide/useReviewGuideWriter.ts:40`（comparison）；`apps/web/src/components/pullRequest/guide/useReviewGuideWriter.ts:54`（comparison）

### `Skipped`（A，message，1 处）

- 显示位置（照常转换）：`apps/web/src/components/settings/BrowserImportWizard.tsx:568`（A，DoneStep）
- 同一文本作为值用途字面量出现 2 次：`apps/server/src/project/AgentSessionImporter.ts:221`（comparison）；`apps/server/src/project/AgentSessionScanner.ts:179`（ts-type）

### `Span`（A，message，1 处）

- 显示位置（照常转换）：`apps/web/src/components/settings/DiagnosticsSettings.tsx:1279`（A，DiagnosticsSettingsPanel）
- 同一文本作为值用途字面量出现 1 次：`packages/shared/src/nodeSqliteClient.ts:90`（comparison）

### `This connection cannot read host files.`（A，message，1 处）

- 显示位置（照常转换）：`apps/web/src/components/files/FilePreviewPanel.tsx:1246`（A，FilePreviewPanel）
- 同一文本作为值用途字面量出现 1 次：`apps/web/src/components/media/MediaActions.tsx:74`（error-constructor）

### `Type`（A，message，1 处）

- 显示位置（照常转换）：`apps/web/src/components/settings/DiagnosticsSettings.tsx:373`（A，ProcessDiagnosticsTable）
- 同一文本作为值用途字面量出现 23 次：`apps/server/src/textGeneration/ClaudeTextGeneration.ts:153`（ts-type）；`apps/server/src/textGeneration/CodexTextGeneration.ts:240`（ts-type）；`packages/contracts/src/baseSchemas.ts:160`（ts-type）；`packages/contracts/src/baseSchemas.ts:161`（ts-type）；`packages/contracts/src/baseSchemas.ts:172`（ts-type）；`packages/contracts/src/baseSchemas.ts:232`（ts-type）；`packages/contracts/src/baseSchemas.ts:276`（ts-type）；`packages/contracts/src/baseSchemas.ts:277`（ts-type）；`packages/contracts/src/baseSchemas.ts:281`（ts-type）；`packages/contracts/src/orchestrationV2.ts:862`（ts-type）；…（共 23 处）

### `Unknown`（A，message，1 处）

- 显示位置（照常转换）：`apps/web/src/components/device/DeviceToolsPanel.tsx:394`（A，ChoiceSelect）
- 同一文本作为值用途字面量出现 6 次：`apps/server/src/project/AgentSessionJson.ts:33`（switch-case）；`apps/server/src/provider/AntigravityInstallation.ts:365`（comparison）；`apps/server/src/provider/Drivers/CodexHomeLayout.ts:149`（comparison）；`apps/web/src/components/settings/ResourceTelemetryDiagnostics.tsx:1060`（never-attribute）；`packages/contracts/src/resourceTelemetry.ts:240`（schema-literal）；`packages/shared/src/symlink.ts:43`（error-constructor）

### `Worktree`（A，message，1 处）

- 显示位置（照常转换）：`apps/web/src/components/PullRequestThreadDialog.tsx:328`（A，PullRequestThreadDialog）
- 同一文本作为值用途字面量出现 3 次：`apps/server/src/project/AgentSessionScanner.ts:701`（ts-type）；`apps/server/src/project/AgentSessionScanner.ts:715`（as-const）；`apps/server/src/project/AgentSessionScanner.ts:1241`（comparison）

### `agent`（A，message，1 处）

- 显示位置（照常转换）：`apps/web/src/components/chat/ThreadLineageWorkflowRow.tsx:218`（A，ThreadLineageWorkflowRow）
- 同一文本作为值用途字面量出现 170 次：`apps/desktop/src/preview/Manager.ts:112`（ts-type）；`apps/desktop/src/preview/PickPreload.ts:64`（comparison）；`apps/desktop/src/preview/PickPreload.ts:84`（comparison）；`apps/desktop/src/preview/RecordingCursor.ts:44`（ts-type）；`apps/desktop/src/preview/RecordingCursor.ts:59`（comparison）；`apps/desktop/src/preview/RecordingCursor.ts:128`（comparison）；`apps/server/src/cli/triage.ts:55`（object-key）；`apps/server/src/cli/triage.ts:153`（schema-literal）；`apps/server/src/cli/triage.ts:165`（object-key）；`apps/server/src/cli/triage.ts:235`（object-key）；…（共 170 处）

### `agents`（A，message，1 处）

- 显示位置（照常转换）：`apps/web/src/components/chat/ThreadLineageWorkflowRow.tsx:218`（A，ThreadLineageWorkflowRow）
- 同一文本作为值用途字面量出现 24 次：`apps/server/src/orchestration-v2/Adapters/ClaudeAdapterV2.ts:4641`（object-key）；`apps/server/src/orchestration-v2/Adapters/claudeWorkflowProgress.ts:100`（object-key）；`apps/server/src/orchestration-v2/Adapters/claudeWorkflowProgress.ts:115`（object-key）；`apps/server/src/orchestration-v2/Adapters/claudeWorkflowProgress.ts:187`（object-key）；`apps/web/src/components/chat/agentSpawnSummary.ts:9`（object-key）；`apps/web/src/components/chat/agentSpawnSummary.ts:13`（object-key）；`apps/web/src/components/onboarding/WelcomeWizard.tsx:112`（ts-type）；`apps/web/src/components/onboarding/WelcomeWizard.tsx:172`（comparison）；`apps/web/src/components/onboarding/WelcomeWizard.tsx:279`（comparison）；`apps/web/src/rightPanelStore.ts:473`（comparison）；…（共 24 处）

### `and`（A，message，1 处）

- 显示位置（照常转换）：`apps/web/src/components/settings/KeybindingsSettings.tsx:509`（A，WhenExpressionNodeEditor）
- 同一文本作为值用途字面量出现 13 次：`apps/server/src/keybindings.ts:185`（switch-case）；`apps/web/src/components/settings/KeybindingsSettings.logic.ts:103`（switch-case）；`apps/web/src/components/settings/KeybindingsSettings.logic.ts:317`（switch-case）；`apps/web/src/components/settings/KeybindingsSettings.tsx:149`（ts-type）；`apps/web/src/components/settings/KeybindingsSettings.tsx:486`（comparison）；`apps/web/src/components/settings/KeybindingsSettings.tsx:509`（never-attribute）；`apps/web/src/keybindings.ts:78`（switch-case）；`packages/client-runtime/src/work-log/commandLabel.ts:76`（membership）；`packages/client-runtime/src/work-log/commandLabel.ts:166`（membership）；`packages/contracts/src/keybindings.ts:181`（schema-literal）；…（共 13 处）

### `approval`（A，message，1 处）

- 显示位置（照常转换）：`apps/web/src/components/pullRequest/PullRequestDetailPanel.tsx:2919`（A，PullRequestDetailPanel）
- 同一文本作为值用途字面量出现 33 次：`apps/server/src/orchestration-v2/Adapters/ClaudeAdapterV2.ts:3276`（ts-type）；`apps/server/src/orchestration-v2/Adapters/CodexAdapterV2.ts:1253`（ts-type）；`apps/web/src/components/Sidebar.logic.ts:956`（ts-type）；`apps/web/src/components/Sidebar.logic.ts:973`（comparison）；`apps/web/src/components/Sidebar.logic.ts:985`（comparison）；`apps/web/src/components/Sidebar.logic.ts:1007`（ts-type）；`apps/web/src/components/Sidebar.logic.ts:1027`（comparison）；`apps/web/src/components/Sidebar.logic.ts:1185`（comparison）；`apps/web/src/components/Sidebar.tsx:1276`（comparison）；`apps/web/src/components/Sidebar.tsx:1321`（comparison）；…（共 33 处）

### `approvals`（A，message，1 处）

- 显示位置（照常转换）：`apps/web/src/components/pullRequest/PullRequestDetailPanel.tsx:2919`（A，PullRequestDetailPanel）
- 同一文本作为值用途字面量出现 13 次：`apps/server/src/orchestration-v2/Adapters/ClaudeAdapterV2.ts:312`（object-key）；`apps/server/src/orchestration-v2/Adapters/CodexAdapterV2.ts:277`（object-key）；`apps/web/src/components/ChatView.tsx:3390`（object-key）；`apps/web/src/components/clerk/MobileClientsUserProfilePage.logic.ts:9`（as-const）；`packages/client-runtime/src/state/threadRequests.ts:40`（object-key）；`packages/client-runtime/src/state/threadRequests.ts:114`（object-key）；`packages/contracts/src/orchestrationV2.ts:325`（object-key）；`packages/provider-acp/src/server/adapter.ts:582`（object-key）；`packages/provider-cursor/src/server/adapter.ts:125`（object-key）；`packages/provider-muse/src/server/adapter.ts:142`（object-key）；…（共 13 处）

### `as`（A，message，1 处）

- 显示位置（照常转换）：`apps/web/src/components/settings/SourceControlSettings.tsx:220`（A，itemSummary）
- 同一文本作为值用途字面量出现 2 次：`apps/web/src/components/ChatMarkdown.tsx:754`（object-key）；`apps/web/src/components/ChatMarkdown.tsx:764`（object-key）

### `author`（A，message，1 处）

- 显示位置（照常转换）：`apps/web/src/components/pullRequest/PullRequestTimelineTab.tsx:332`（A，ConversationGroup）
- 同一文本作为值用途字面量出现 111 次：`apps/server/src/orchestration-v2/PullRequestSyncReactor.ts:62`（object-key）；`apps/server/src/orchestration-v2/pullRequestWatch.ts:46`（ts-type）；`apps/server/src/pullRequest/PullRequestService.ts:1232`（object-key）；`apps/server/src/pullRequest/PullRequestService.ts:1721`（object-key）；`apps/server/src/pullRequest/PullRequestService.ts:1807`（object-key）；`apps/server/src/pullRequest/PullRequestService.ts:1855`（object-key）；`apps/server/src/pullRequest/PullRequestService.ts:1894`（object-key）；`apps/server/src/pullRequest/PullRequestService.ts:2925`（object-key）；`apps/server/src/pullRequest/PullRequestService.ts:3170`（object-key）；`apps/web/src/components/pullRequest/PullRequestCodeTab.tsx:971`（object-key）；…（共 111 处）

### `authors`（A，message，1 处）

- 显示位置（照常转换）：`apps/web/src/components/pullRequest/PullRequestTimelineTab.tsx:332`（A，ConversationGroup）
- 同一文本作为值用途字面量出现 17 次：`apps/web/src/components/pullRequest/pullRequestList.logic.ts:125`（object-key）；`packages/contracts/src/acpRegistry.ts:64`（object-key）；`packages/contracts/src/pullRequest.ts:346`（object-key）；`packages/provider-acp-registry/src/server/AcpRegistrySupport.ts:139`（object-key）；`packages/provider-acp-registry/src/server/AcpRegistrySupport.ts:1638`（object-key）；`packages/source-control-bitbucket/src/server/bitbucketPullRequestJson.ts:540`（object-key）；`packages/source-control-forgejo/src/server/forgejoPullRequestJson.ts:204`（object-key）；`packages/source-control-gitcafe/src/server/GitCafePullRequestProvider.ts:532`（key-argument）；`packages/source-control-github/src/server/GitHubPullRequestProvider.ts:458`（object-key）；`packages/source-control-github/src/server/gitHubPullRequestJson.ts:424`（object-key）；…（共 17 处）

### `auto-settle`（B，message，1 处）

- 显示位置（照常转换）：`apps/web/src/components/settings/SettingsPanels.tsx:2460`（B，GeneralSettingsPanel）
- 同一文本作为值用途字面量出现 2 次：`apps/web/src/components/threadActionMenu.logic.ts:17`（ts-type）；`apps/web/src/components/threadActionMenu.logic.ts:201`（as-const）

### `available`（A，message，1 处）

- 显示位置（照常转换）：`apps/web/src/components/device/DeviceHostAvailability.tsx:17`（A，DeviceHostAvailability）
- 同一文本作为值用途字面量出现 108 次：`apps/desktop/src/ipc/methods/wsl.ts:32`（object-key）；`apps/desktop/src/snapShot/DesktopSnapShot.ts:696`（object-key）；`apps/desktop/src/snapShot/DesktopSnapShot.ts:701`（object-key）；`apps/desktop/src/snapShot/DesktopSnapShot.ts:703`（object-key）；`apps/desktop/src/snapShot/DesktopSnapShot.ts:1016`（object-key）；`apps/desktop/src/snapShot/DesktopSnapShot.ts:1020`（object-key）；`apps/desktop/src/snapShot/DesktopSnapShot.ts:1026`（object-key）；`apps/desktop/src/snapShot/DesktopSnapShot.ts:1032`（object-key）；`apps/desktop/src/snapShot/DesktopSnapShot.ts:1046`（object-key）；`apps/desktop/src/snapShot/DesktopSnapShot.ts:1053`（object-key）；…（共 108 处）

### `base64`（A，message，1 处）

- 显示位置（照常转换）：`apps/web/src/components/settings/ScheduledTasksSettings.tsx:1269`（A，ScheduledTaskEditorDialog）
- 同一文本作为值用途字面量出现 15 次：`apps/desktop/src/preview/FaviconCapture.ts:219`（comparison）；`apps/desktop/src/preview/FaviconCapture.ts:220`（membership）；`apps/desktop/src/preview/FaviconCapture.ts:227`（comparison）；`apps/server/src/htmlRender/HtmlRender.ts:298`（as-const）；`apps/server/src/imageMime.ts:56`（object-key）；`apps/server/src/imageMime.ts:76`（comparison）；`apps/server/src/imageMime.ts:113`（object-key）；`apps/server/src/orchestration-v2/toolOutputImageBytes.ts:9`（membership）；`apps/server/src/orchestration-v2/toolOutputImageBytes.ts:35`（comparison）；`apps/web/src/components/settings/ScheduledTasksSettings.tsx:1260`（comparison）；…（共 15 处）

### `chain`（A，message，1 处）

- 显示位置（照常转换）：`apps/web/src/components/ThreadStatusIndicators.tsx:383`（A，ThreadPullRequestsMiniList）
- 同一文本作为值用途字面量出现 5 次：`apps/web/src/components/ComposerPromptEditorTiptap.tsx:603`（object-key）；`apps/web/src/components/ComposerPromptEditorTiptap.tsx:631`（object-key）；`apps/web/src/components/ComposerPromptEditorTiptap.tsx:676`（object-key）；`apps/web/src/components/ComposerPromptEditorTiptap.tsx:697`（object-key）；`apps/web/src/components/ComposerPromptEditorTiptap.tsx:730`（object-key）

### `cost`（A，message，1 处）

- 显示位置（照常转换）：`apps/web/src/components/usage/UsagePage.tsx:712`（A，UsagePage）
- 同一文本作为值用途字面量出现 27 次：`apps/server/src/textGeneration/OpenCode2TextGeneration.fixture.ts:44`（object-key）；`apps/server/src/textGeneration/OpenCode2TextGeneration.fixture.ts:321`（object-key）；`apps/server/src/textGeneration/OpenCode2TextGeneration.fixture.ts:341`（object-key）；`apps/web/src/components/usage/UsagePage.tsx:586`（comparison）；`apps/web/src/components/usage/UsagePage.tsx:595`（comparison）；`apps/web/src/components/usage/UsagePage.tsx:597`（comparison）；`apps/web/src/components/usage/UsagePage.tsx:645`（comparison）；`apps/web/src/components/usage/UsagePage.tsx:687`（comparison）；`apps/web/src/components/usage/UsagePage.tsx:700`（comparison）；`apps/web/src/components/usage/UsageProviderChart.tsx:23`（ts-type）；…（共 27 处）

### `custom`（A，message，1 处）

- 显示位置（照常转换）：`apps/web/src/components/settings/ProviderModelsSection.tsx:493`（A，renderRow）
- 同一文本作为值用途字面量出现 79 次：`apps/server/src/git/GitManager.ts:814`（switch-case）；`apps/server/src/orchestration-v2/ThreadLaunchService.ts:372`（comparison）；`apps/web/src/components/settings/BranchNamingSettings.tsx:19`（object-key）；`apps/web/src/components/settings/BranchNamingSettings.tsx:117`（comparison）；`apps/web/src/components/settings/SettingInheritance.tsx:34`（object-key）；`apps/web/src/components/settings/SettingsPanels.logic.ts:196`（comparison）；`apps/web/src/components/settings/SettingsPanels.logic.ts:208`（comparison）；`apps/web/src/components/settings/SettingsPanels.logic.ts:327`（as-const）；`apps/web/src/components/settings/SourceControlSettings.tsx:112`（as-const）；`apps/web/src/components/settings/SourceControlWritingSettings.tsx:59`（object-key）；…（共 79 处）

### `days`（A，message，1 处）

- 显示位置（照常转换）：`apps/web/src/components/settings/StorageSettings.tsx:151`（A，RetentionControl）
- 同一文本作为值用途字面量出现 26 次：`apps/server/src/auth/EnvironmentAuth.ts:884`（object-key）；`apps/server/src/scheduledTasks/Schedule.ts:30`（object-key）；`apps/server/src/storageCleanup.ts:761`（object-key）；`apps/server/src/storageCleanup.ts:767`（object-key）；`apps/web/src/components/CustomSnoozeDialog.tsx:64`（ts-type）；`apps/web/src/components/CustomSnoozeDialog.tsx:189`（object-key）；`apps/web/src/components/CustomSnoozeDialog.tsx:191`（comparison）；`apps/web/src/components/CustomSnoozeDialog.tsx:202`（never-attribute）；`apps/web/src/components/usage/UsageModelDialog.tsx:29`（object-key）；`apps/web/src/components/usage/UsagePage.tsx:127`（object-key）；…（共 26 处）

### `folder`（A，message，1 处）

- 显示位置（照常转换）：`apps/web/src/components/onboarding/WelcomeWizard.tsx:1620`（A，ImportCandidateList）
- 同一文本作为值用途字面量出现 10 次：`apps/server/src/project/ManagedProjectFolders.ts:51`（object-key）；`apps/server/src/project/ManagedProjectFolders.ts:77`（object-key）；`apps/server/src/project/ManagedProjectFolders.ts:297`（object-key）；`apps/server/src/project/ManagedProjectFolders.ts:384`（object-key）；`apps/server/src/project/ManagedProjectFolders.ts:386`（object-key）；`apps/server/src/project/ManagedProjectFolders.ts:402`（object-key）；`apps/server/src/project/ManagedProjectFolders.ts:418`（object-key）；`apps/server/src/project/ManagedProjectFolders.ts:422`（object-key）；`apps/server/src/project/ManagedProjectFolders.ts:481`（object-key）；`apps/web/src/contextMenuFallback.ts:40`（object-key）

### `folders`（A，message，1 处）

- 显示位置（照常转换）：`apps/web/src/components/onboarding/WelcomeWizard.tsx:1620`（A，ImportCandidateList）
- 同一文本作为值用途字面量出现 4 次：`apps/web/src/components/chat/workspaceFileDrop.ts:35`（object-key）；`apps/web/src/components/chat/workspaceFileDrop.ts:38`（object-key）；`apps/web/src/components/chat/workspaceFileDrop.ts:52`（object-key）；`apps/web/src/components/chat/workspaceFileDrop.ts:79`（object-key）

### `gh auth login`（A，message，1 处）

- 显示位置（照常转换）：`apps/web/src/components/settings/GitHubAccountSettings.tsx:85`（A，GitHubAccountSettings）
- 同一文本作为值用途字面量出现 1 次：`apps/server/src/vcs/VcsProcess.ts:71`（membership）

### `ghost`（A，message，1 处）

- 显示位置（照常转换）：`apps/web/src/components/pullRequest/PullRequestTimelineTab.tsx:93`（A，ActorName）
- 同一文本作为值用途字面量出现 11 次：`apps/web/src/components/chat/MessageCopyButton.tsx:30`（ts-type）；`apps/web/src/components/chat/MessageCopyButton.tsx:52`（comparison）；`apps/web/src/components/ui/button.tsx:48`（object-key）；`apps/web/src/components/ui/input-group.tsx:27`（object-key）；`apps/web/src/components/ui/menu.tsx:83`（ts-type）；`apps/web/src/components/ui/menu.tsx:89`（comparison）；`apps/web/src/components/ui/menu.tsx:91`（non-display-call）；`apps/web/src/components/ui/select.tsx:24`（object-key）；`apps/web/src/components/ui/toast.tsx:51`（ts-type）；`apps/web/src/components/ui/toast.tsx:65`（ts-type）；…（共 11 处）

### `hex`（A，message，1 处）

- 显示位置（照常转换）：`apps/web/src/components/settings/ScheduledTasksSettings.tsx:1268`（A，ScheduledTaskEditorDialog）
- 同一文本作为值用途字面量出现 9 次：`apps/server/src/preview/PreviewBrowser.ts:243`（comparison）；`apps/server/src/provider/AntigravityInstallation.ts:569`（comparison）；`apps/server/src/provider/CodexInstallation.ts:504`（comparison）；`apps/server/src/scheduledTasks/webhookVerification.ts:31`（comparison）；`apps/server/src/scheduledTasks/webhookVerification.ts:34`（comparison）；`apps/web/src/components/settings/ScheduledTasksSettings.tsx:1268`（never-attribute）；`apps/web/src/components/settings/scheduledTasksSettings.logic.ts:78`（ts-type）；`apps/web/src/components/settings/scheduledTasksSettings.logic.ts:89`（as-const）；`packages/contracts/src/scheduledTask.ts:63`（schema-literal）

### `left`（A，message，1 处）

- 显示位置（照常转换）：`apps/web/src/components/usage/UsageLimitsPooled.tsx:518`（A，PoolWindowCard）
- 同一文本作为值用途字面量出现 142 次：`apps/desktop/src/preview/PickPreload.ts:659`（object-key）；`apps/desktop/src/preview/PickPreload.ts:1009`（object-key）；`apps/desktop/src/preview/PickPreload.ts:1013`（object-key）；`apps/desktop/src/preview/PickPreload.ts:1024`（object-key）；`apps/desktop/src/preview/PickPreload.ts:1052`（object-key）；`apps/desktop/src/preview/PickPreload.ts:1053`（object-key）；`apps/desktop/src/preview/PickPreload.ts:1055`（object-key）；`apps/desktop/src/preview/PickPreload.ts:1059`（object-key）；`apps/desktop/src/preview/PickPreload.ts:1063`（object-key）；`apps/desktop/src/preview/PickPreload.ts:1089`（object-key）；…（共 142 处）

### `minutes`（A，message，1 处）

- 显示位置（照常转换）：`apps/web/src/components/settings/ScheduledTasksSettings.tsx:1347`（A，ScheduledTaskEditorDialog）
- 同一文本作为值用途字面量出现 11 次：`apps/server/src/cli/trace.ts:116`（object-key）；`apps/server/src/cloud/CloudLink.ts:646`（object-key）；`apps/server/src/cloud/CloudLink.ts:1576`（object-key）；`apps/server/src/orchestration-v2/PullRequestWatchReactor.ts:274`（object-key）；`apps/server/src/relay/AgentAwarenessRelay.ts:262`（object-key）；`apps/web/src/components/CustomSnoozeDialog.tsx:64`（ts-type）；`apps/web/src/components/CustomSnoozeDialog.tsx:189`（object-key）；`apps/web/src/components/CustomSnoozeDialog.tsx:191`（comparison）；`apps/web/src/components/CustomSnoozeDialog.tsx:200`（never-attribute）；`packages/client-runtime/src/state/threadSettled.ts:332`（ts-type）；…（共 11 处）

### `none`（A，message，1 处）

- 显示位置（照常转换）：`apps/web/src/components/GitActionsControl.tsx:1988`（A，GitActionsControl）
- 同一文本作为值用途字面量出现 142 次：`apps/desktop/src/electron/ElectronDialog.ts:42`（schema-literal）；`apps/desktop/src/preview/FaviconCapture.ts:37`（ts-type）；`apps/desktop/src/preview/Manager.ts:112`（ts-type）；`apps/desktop/src/preview/PickPreload.ts:64`（comparison）；`apps/desktop/src/preview/PickPreload.ts:84`（comparison）；`apps/desktop/src/preview/PickPreload.ts:1078`（comparison）；`apps/desktop/src/preview/RecordingCursor.ts:44`（ts-type）；`apps/server/src/auth/mcpOAuthHttp.ts:83`（as-const）；`apps/server/src/cloud/managedTunnelStartup.ts:16`（ts-type）；`apps/server/src/device/DeviceActions.ts:527`（comparison）；…（共 142 处）

### `now`（A，message，1 处）

- 显示位置（照常转换）：`apps/web/src/components/chat/ComposerTasksBadge.tsx:209`（A，ComposerTasksContent）
- 同一文本作为值用途字面量出现 176 次：`apps/server/src/auth/PairingGrantStore.ts:358`（object-key）；`apps/server/src/auth/PairingGrantStore.ts:573`（object-key）；`apps/server/src/auth/SessionStore.ts:977`（object-key）；`apps/server/src/background/BackgroundPolicy.ts:184`（object-key）；`apps/server/src/background/BackgroundPolicy.ts:231`（object-key）；`apps/server/src/mcp/McpSessionRegistry.ts:65`（object-key）；`apps/server/src/orchestration-v2/Adapters/ClaudeAdapterV2.ts:1284`（object-key）；`apps/server/src/orchestration-v2/Adapters/ClaudeAdapterV2.ts:1410`（object-key）；`apps/server/src/orchestration-v2/Adapters/ClaudeAdapterV2.ts:3539`（object-key）；`apps/server/src/orchestration-v2/Adapters/ClaudeAdapterV2.ts:4659`（object-key）；…（共 176 处）

### `optionId`（B，message，1 处）

- 显示位置（照常转换）：`apps/web/src/components/settings/CustomModelEditor.tsx:233`（B，renderDescriptor）
- 同一文本作为值用途字面量出现 19 次：`apps/server/src/provider/acp/AntigravityProtocol.ts:172`（object-key）；`apps/server/src/provider/acp/AntigravityProtocol.ts:176`（object-key）；`apps/web/src/components/chat/ComposerCommandMenu.tsx:161`（object-key）；`packages/effect-acp/src/_generated/schema-v1.gen.ts:3112`（object-key）；`packages/effect-acp/src/_generated/schema-v1.gen.ts:3122`（object-key）；`packages/effect-acp/src/_generated/schema-v1.gen.ts:3141`（object-key）；`packages/effect-acp/src/_generated/schema-v1.gen.ts:3147`（object-key）；`packages/effect-acp/src/_generated/schema-v1.gen.ts:9035`（object-key）；`packages/effect-acp/src/_generated/schema-v1.gen.ts:9039`（object-key）；`packages/effect-acp/src/_generated/schema.gen.ts:3169`（object-key）；…（共 19 处）

### `or`（A，message，1 处）

- 显示位置（照常转换）：`apps/web/src/components/settings/KeybindingsSettings.tsx:510`（A，WhenExpressionNodeEditor）
- 同一文本作为值用途字面量出现 13 次：`apps/server/src/keybindings.ts:187`（switch-case）；`apps/web/src/components/settings/KeybindingsSettings.logic.ts:105`（switch-case）；`apps/web/src/components/settings/KeybindingsSettings.logic.ts:318`（switch-case）；`apps/web/src/components/settings/KeybindingsSettings.tsx:149`（ts-type）；`apps/web/src/components/settings/KeybindingsSettings.tsx:434`（comparison）；`apps/web/src/components/settings/KeybindingsSettings.tsx:510`（never-attribute）；`apps/web/src/keybindings.ts:80`（switch-case）；`packages/client-runtime/src/work-log/commandLabel.ts:128`（membership）；`packages/client-runtime/src/work-log/commandLabel.ts:191`（membership）；`packages/contracts/src/keybindings.ts:186`（schema-literal）；…（共 13 处）

### `origin`（B，message，1 处）

- 显示位置（照常转换）：`apps/web/src/components/GitActionsControl.tsx:855`（B，PublishRepositoryDialog）
- 同一文本作为值用途字面量出现 124 次：`apps/desktop/src/electron/ElectronProtocol.ts:187`（comparison）；`apps/desktop/src/preview/PasskeyBackend.ts:6`（object-key）；`apps/desktop/src/preview/Passkeys.ts:209`（object-key）；`apps/server/src/cli/pair.ts:177`（object-key）；`apps/server/src/cli/pair.ts:534`（object-key）；`apps/server/src/cli/project.ts:358`（object-key）；`apps/server/src/cli/project.ts:364`（object-key）；`apps/server/src/cli/project.ts:375`（object-key）；`apps/server/src/cli/project.ts:379`（object-key）；`apps/server/src/cli/sshHelper.ts:118`（object-key）；…（共 124 处）

### `outdated`（A，message，1 处）

- 显示位置（照常转换）：`apps/web/src/components/pullRequest/PullRequestReviewAnnotation.tsx:255`（A，ReviewThreadCard）
- 同一文本作为值用途字面量出现 1 次：`packages/source-control-bitbucket/src/server/bitbucketPullRequestJson.ts:117`（object-key）

### `override`（B，message，1 处）

- 显示位置（照常转换）：`apps/web/src/components/settings/settingsLayout.tsx:363`（B，SettingsRow）
- 同一文本作为值用途字面量出现 4 次：`apps/server/src/provider/AntigravityInstallation.ts:76`（ts-type）；`apps/server/src/provider/AntigravityInstallation.ts:248`（ts-type）；`packages/contracts/src/relayClient.ts:7`（schema-literal）；`packages/shared/src/relayClient.ts:38`（ts-type）

### `process`（A，message，1 处）

- 显示位置（照常转换）：`apps/web/src/components/settings/ResourceTelemetryDiagnostics.tsx:280`（A，AggregateCard）
- 同一文本作为值用途字面量出现 58 次：`apps/desktop/src/wsl/DesktopWslEnvironment.ts:160`（ts-type）；`apps/desktop/src/wsl/DesktopWslEnvironment.ts:179`（switch-case）；`apps/server/src/resourceTelemetry/Model.ts:17`（object-key）；`apps/server/src/resourceTelemetry/Model.ts:565`（object-key）；`apps/server/src/resourceTelemetry/ResourceTelemetryHistory.ts:44`（object-key）；`apps/server/src/resourceTelemetry/ResourceTelemetryHistory.ts:268`（object-key）；`apps/server/src/serviceLauncher.ts:54`（object-key）；`apps/server/src/serviceLauncher.ts:641`（object-key）；`apps/server/src/sourceControl/ServerSourceControlHost.ts:25`（object-key）；`apps/server/src/sourceControl/SourceControlProviderRegistry.ts:242`（object-key）；…（共 58 处）

### `processes`（A，message，1 处）

- 显示位置（照常转换）：`apps/web/src/components/settings/ResourceTelemetryDiagnostics.tsx:280`（A，AggregateCard）
- 同一文本作为值用途字面量出现 20 次：`apps/server/src/diagnostics/ProcessDiagnostics.ts:84`（object-key）；`apps/server/src/resourceTelemetry/Model.ts:61`（object-key）；`apps/server/src/resourceTelemetry/Model.ts:600`（object-key）；`apps/server/src/resourceTelemetry/NativeTelemetryClient.ts:682`（object-key）；`apps/server/src/resourceTelemetry/NativeTelemetryClient.ts:855`（object-key）；`apps/server/src/resourceTelemetry/ResourceTelemetry.ts:187`（object-key）；`apps/server/src/resourceTelemetry/ResourceTelemetry.ts:300`（object-key）；`apps/web/src/components/settings/DiagnosticsSettings.tsx:303`（object-key）；`apps/web/src/components/settings/DiagnosticsSettings.tsx:309`（object-key）；`apps/web/src/components/settings/DiagnosticsSettings.tsx:562`（object-key）；…（共 20 处）

### `root`（B，message，1 处）

- 显示位置（照常转换）：`apps/web/src/components/settings/ConnectionsSettings.tsx:3116`（B，renderSshFields）
- 同一文本作为值用途字面量出现 105 次：`apps/desktop/src/snapShot/SnapShotAccessibility.ts:46`（ts-type）；`apps/desktop/src/snapShot/SnapShotAccessibility.ts:74`（object-key）；`apps/desktop/src/snapShot/SnapShotAccessibility.ts:88`（object-key）；`apps/desktop/src/snapShot/snapShot.ts:304`（object-key）；`apps/desktop/src/snapShot/snapShot.ts:340`（object-key）；`apps/desktop/src/snapShot/snapShot.ts:359`（object-key）；`apps/desktop/src/snapShot/snapShot.ts:439`（object-key）；`apps/desktop/src/wsl/DesktopWslServerTree.ts:24`（object-key）；`apps/desktop/src/wsl/DesktopWslServerTree.ts:206`（object-key）；`apps/desktop/src/wsl/DesktopWslServerTree.ts:210`（object-key）；…（共 105 处）

### `server`（B，message，1 处）

- 显示位置（照常转换）：`apps/web/src/components/settings/ConnectionsSettings.tsx:3689`（B，ConnectionsSettings）
- 同一文本作为值用途字面量出现 232 次：`apps/desktop/src/app/DesktopAppActivation.ts:218`（object-key）；`apps/desktop/src/app/DesktopAppActivation.ts:232`（object-key）；`apps/desktop/src/app/DesktopAppActivation.ts:252`（object-key）；`apps/server/src/cli/triage.ts:202`（object-key）；`apps/server/src/cli/triagePrompt.ts:189`（object-key）；`apps/server/src/diagnostics/ProcessResourceMonitor.ts:24`（comparison）；`apps/server/src/diagnostics/ProcessResourceMonitor.ts:45`（comparison）；`apps/server/src/htmlRender/publicProxy.ts:149`（object-key）；`apps/server/src/htmlRender/publicProxy.ts:231`（object-key）；`apps/server/src/htmlRender/publicProxy.ts:234`（object-key）；…（共 232 处）

### `setup`（A，message，1 处）

- 显示位置（照常转换）：`apps/web/src/components/settings/ProjectActionsList.tsx:38`（A，ProjectActionsList）
- 同一文本作为值用途字面量出现 14 次：`apps/desktop/src/snapShot/DesktopSnapShot.ts:176`（object-key）；`apps/desktop/src/snapShot/DesktopSnapShot.ts:1520`（object-key）；`apps/server/src/project/ProjectSetupScriptRunner.ts:65`（ts-type）；`apps/server/src/provider/AntigravityProvider.ts:162`（object-key）；`apps/server/src/provider/Drivers/CodexManagedProvider.ts:63`（object-key）；`apps/server/src/provider/Drivers/CodexManagedProvider.ts:157`（object-key）；`apps/web/src/components/files/useFileSaveCoordinator.ts:35`（object-key）；`apps/web/src/components/settings/ProviderInstanceCard.tsx:620`（object-key）；`apps/web/src/components/settings/ProviderInstanceCard.tsx:685`（object-key）；`apps/web/src/components/settings/ProviderWizardAuthenticationStep.tsx:50`（object-key）；…（共 14 处）

### `stack`（A，message，1 处）

- 显示位置（照常转换）：`apps/web/src/components/ThreadStatusIndicators.tsx:383`（A，ThreadPullRequestsMiniList）
- 同一文本作为值用途字面量出现 73 次：`apps/desktop/src/preview/PickPreload.ts:447`（object-key）；`apps/desktop/src/preview/PickPreload.ts:460`（object-key）；`apps/desktop/src/preview/PickedElementPayload.ts:46`（computed-key）；`apps/desktop/src/preview/PickedElementPayload.ts:47`（computed-key）；`apps/server/src/git/detachStackFrame.ts:9`（object-key）；`apps/server/src/mcp/toolkits/pullRequests/handlers.ts:120`（ts-type）；`apps/server/src/mcp/toolkits/pullRequests/handlers.ts:141`（object-key）；`apps/server/src/mcp/toolkits/pullRequests/tools.ts:255`（object-key）；`apps/server/src/orchestration-v2/Orchestrator.ts:580`（object-key）；`apps/server/src/orchestration-v2/Orchestrator.ts:3075`（comparison）；…（共 73 处）

### `team`（A，message，1 处）

- 显示位置（照常转换）：`apps/web/src/components/pullRequest/PullRequestReviewerPicker.tsx:125`（A，PullRequestReviewerPicker）
- 同一文本作为值用途字面量出现 6 次：`apps/server/src/provider/ClaudeProvider.ts:102`（switch-case）；`apps/server/src/provider/CodexProvider.ts:135`（switch-case）；`apps/web/src/components/pullRequest/PullRequestReviewerPicker.tsx:124`（comparison）；`packages/contracts/src/pullRequest.ts:287`（schema-literal）；`packages/provider-cursor/src/server/adapter.ts:300`（as-const）；`packages/source-control-github/src/server/gitHubPullRequestJson.ts:3099`（comparison）

### `unavailable`（A，message，1 处）

- 显示位置（照常转换）：`apps/web/src/components/device/DeviceHostAvailability.tsx:17`（A，DeviceHostAvailability）
- 同一文本作为值用途字面量出现 109 次：`apps/desktop/src/backend/DesktopServerExposure.ts:306`（object-key）；`apps/desktop/src/backend/DesktopServerExposure.ts:406`（object-key）；`apps/desktop/src/preview/BrowserImport/BrowserImport.ts:192`（object-key）；`apps/desktop/src/snapShot/DesktopSnapShot.ts:863`（comparison）；`apps/desktop/src/snapShot/DesktopSnapShot.ts:1015`（comparison）；`apps/desktop/src/snapShot/DesktopSnapShot.ts:1089`（comparison）；`apps/desktop/src/snapShot/DesktopSnapShot.ts:1100`（comparison）；`apps/desktop/src/snapShot/DesktopSnapShot.ts:1103`（comparison）；`apps/desktop/src/snapShot/DesktopSnapShot.ts:1135`（comparison）；`apps/desktop/src/snapShot/DesktopSnapShot.ts:1142`（comparison）；…（共 109 处）

### `viewed`（A，message，1 处）

- 显示位置（照常转换）：`apps/web/src/components/pullRequest/PullRequestCodeTab.tsx:1163`（A，PullRequestCodeTab）
- 同一文本作为值用途字面量出现 14 次：`apps/server/src/persistence/PullRequestFilesViewed.ts:48`（object-key）；`apps/server/src/pullRequest/pullRequestViewedFiles.ts:276`（as-const）；`apps/server/src/pullRequest/pullRequestViewedFiles.ts:284`（as-const）；`apps/server/src/pullRequest/pullRequestViewedFiles.ts:363`（object-key）；`apps/web/src/components/pullRequest/pullRequestFilesViewed.logic.ts:22`（comparison）；`apps/web/src/components/pullRequest/pullRequestFilesViewed.logic.ts:84`（object-key）；`apps/web/src/components/pullRequest/pullRequestFilesViewed.logic.ts:88`（object-key）；`apps/web/src/components/pullRequest/pullRequestFilesViewed.logic.ts:98`（object-key）；`apps/web/src/components/pullRequest/pullRequestFilesViewed.logic.ts:99`（object-key）；`packages/contracts/src/pullRequest.ts:1064`（schema-literal）；…（共 14 处）
