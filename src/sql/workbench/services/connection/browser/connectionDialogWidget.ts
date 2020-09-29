/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the Source EULA. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import 'vs/css!./media/connectionDialog';
import { Button } from 'sql/base/browser/ui/button/button';
import { attachButtonStyler } from 'sql/platform/theme/common/styler';
import { SelectBox } from 'sql/base/browser/ui/selectBox/selectBox';
import { Modal } from 'sql/workbench/browser/modal/modal';
import { IConnectionManagementService, INewConnectionParams } from 'sql/platform/connection/common/connectionManagement';
import * as DialogHelper from 'sql/workbench/browser/modal/dialogHelper';
<<<<<<< HEAD
import { TreeCreationUtils } from 'sql/workbench/services/objectExplorer/browser/treeCreationUtils';
import { TabbedPanel, PanelTabIdentifier } from 'sql/base/browser/ui/panel/panel';
import * as TelemetryKeys from 'sql/platform/telemetry/common/telemetryKeys';
=======
import { TreeCreationUtils } from 'sql/workbench/contrib/objectExplorer/browser/treeCreationUtils';
import { TreeUpdateUtils, IExpandableTree } from 'sql/workbench/contrib/objectExplorer/browser/treeUpdateUtils';
import { ConnectionProfile } from 'sql/platform/connection/common/connectionProfile';
import { TabbedPanel, PanelTabIdentifier } from 'sql/base/browser/ui/panel/panel';
import { RecentConnectionTreeController, RecentConnectionActionsProvider } from 'sql/workbench/contrib/connection/browser/recentConnectionTreeController';
import { SavedConnectionTreeController } from 'sql/workbench/contrib/connection/browser/savedConnectionTreeController';
import * as TelemetryKeys from 'sql/platform/telemetry/common/telemetryKeys';
import { ClearRecentConnectionsAction } from 'sql/workbench/contrib/connection/browser/connectionActions';
>>>>>>> origin/workbenchlinting
import { IContextKeyService } from 'vs/platform/contextkey/common/contextkey';
import { contrastBorder } from 'vs/platform/theme/common/colorRegistry';
import { Event, Emitter } from 'vs/base/common/event';
import { StandardKeyboardEvent } from 'vs/base/browser/keyboardEvent';
import { localize } from 'vs/nls';
import { IContextMenuService, IContextViewService } from 'vs/platform/contextview/browser/contextView';
import { IInstantiationService } from 'vs/platform/instantiation/common/instantiation';
import * as styler from 'vs/platform/theme/common/styler';
import * as DOM from 'vs/base/browser/dom';
import { ActionBar } from 'vs/base/browser/ui/actionbar/actionbar';
import { IClipboardService } from 'vs/platform/clipboard/common/clipboardService';
import { SIDE_BAR_BACKGROUND, PANEL_SECTION_HEADER_BACKGROUND, PANEL_SECTION_HEADER_FOREGROUND, PANEL_SECTION_HEADER_BORDER, PANEL_SECTION_DRAG_AND_DROP_BACKGROUND, PANEL_SECTION_BORDER } from 'vs/workbench/common/theme';
import { IThemeService, IColorTheme } from 'vs/platform/theme/common/themeService';
import { ILogService } from 'vs/platform/log/common/log';
import { ITextResourcePropertiesService } from 'vs/editor/common/services/textResourceConfigurationService';
import { IAdsTelemetryService } from 'sql/platform/telemetry/common/telemetry';
import { entries } from 'sql/base/common/collections';
import { attachTabbedPanelStyler, attachModalDialogStyler } from 'sql/workbench/common/styler';
import { ILayoutService } from 'vs/platform/layout/browser/layoutService';
import { IViewPaneContainer, IView, IViewContainersRegistry, Extensions as ViewContainerExtensions, ViewContainerLocation, IViewDescriptorService, ViewContainer, IViewContainerModel, IAddedViewDescriptorRef, IViewDescriptorRef, ITreeViewDescriptor } from 'vs/workbench/common/views';
import { IAction, IActionViewItem } from 'vs/base/common/actions';
import { Registry } from 'vs/platform/registry/common/platform';
import { SyncDescriptor } from 'vs/platform/instantiation/common/descriptors';
import { ViewPane, IPaneColors } from 'vs/workbench/browser/parts/views/viewPaneContainer';
import { IViewletViewOptions } from 'vs/workbench/browser/parts/views/viewsViewlet';
import { ITreeView } from 'sql/workbench/common/views';
import { IConnectionProfile } from 'azdata';
import { TreeUpdateUtils, IExpandableTree } from 'sql/workbench/services/objectExplorer/browser/treeUpdateUtils';
import { SavedConnectionTreeController } from 'sql/workbench/services/connection/browser/savedConnectionTreeController';
import { ConnectionProfile } from 'sql/platform/connection/common/connectionProfile';
import { ICancelableEvent } from 'vs/base/parts/tree/browser/treeDefaults';
import { RecentConnectionActionsProvider, RecentConnectionTreeController } from 'sql/workbench/services/connection/browser/recentConnectionTreeController';
import { ClearRecentConnectionsAction } from 'sql/workbench/services/connection/browser/connectionActions';
import { combinedDisposable, IDisposable, dispose } from 'vs/base/common/lifecycle';
import { ITree } from 'vs/base/parts/tree/browser/tree';
import { AsyncServerTree } from 'sql/workbench/services/objectExplorer/browser/asyncServerTree';
import { IConfigurationService } from 'vs/platform/configuration/common/configuration';

export interface OnShowUIResponse {
	selectedProviderDisplayName: string;
	container: HTMLElement;
}

export class ConnectionDialogWidget extends Modal implements IViewPaneContainer {
	private _body: HTMLElement;
	private _recentConnection: HTMLElement;
	private _noRecentConnection: HTMLElement;
	private _savedConnection: HTMLElement;
	private _noSavedConnection: HTMLElement;
	private _connectionDetailTitle: HTMLElement;
	private _connectButton: Button;
	private _closeButton: Button;
	private _providerTypeSelectBox: SelectBox;
	private _newConnectionParams: INewConnectionParams;
	private _recentConnectionTree: AsyncServerTree | ITree;
	private _savedConnectionTree: AsyncServerTree | ITree;
	private _connectionUIContainer: HTMLElement;
	private _databaseDropdownExpanded: boolean;
	private _actionbar: ActionBar;
	private _providers: string[];

	private _panel: TabbedPanel;
	private _recentConnectionTabId: PanelTabIdentifier;

	private _onInitDialog = new Emitter<void>();
	public onInitDialog: Event<void> = this._onInitDialog.event;

	private _onCancel = new Emitter<void>();
	public onCancel: Event<void> = this._onCancel.event;

	private _onConnect = new Emitter<IConnectionProfile>();
	public onConnect: Event<IConnectionProfile> = this._onConnect.event;

	private _onShowUiComponent = new Emitter<OnShowUIResponse>();
	public onShowUiComponent: Event<OnShowUIResponse> = this._onShowUiComponent.event;

	private _onFillinConnectionInputs = new Emitter<IConnectionProfile>();

	public onFillinConnectionInputs: Event<IConnectionProfile> = this._onFillinConnectionInputs.event;
	private _onResetConnection = new Emitter<void>();
	public onResetConnection: Event<void> = this._onResetConnection.event;

	private _connecting = false;

	readonly viewContainer: ViewContainer;
	protected readonly viewContainerModel: IViewContainerModel;
	private paneItems: { pane: ViewPane, disposable: IDisposable }[] = [];
	private orthogonalSize = 0;

	constructor(
		private providerDisplayNameOptions: string[],
		private selectedProviderType: string,
		private providerNameToDisplayNameMap: { [providerDisplayName: string]: string },
		@IInstantiationService private readonly instantiationService: IInstantiationService,
		@IConnectionManagementService private readonly connectionManagementService: IConnectionManagementService,
		@IContextMenuService private readonly contextMenuService: IContextMenuService,
		@IContextViewService private readonly contextViewService: IContextViewService,
		@IViewDescriptorService viewDescriptorService: IViewDescriptorService,
		@IThemeService themeService: IThemeService,
		@ILayoutService layoutService: ILayoutService,
		@IAdsTelemetryService telemetryService: IAdsTelemetryService,
		@IContextKeyService contextKeyService: IContextKeyService,
		@IClipboardService clipboardService: IClipboardService,
		@ILogService logService: ILogService,
		@ITextResourcePropertiesService textResourcePropertiesService: ITextResourcePropertiesService,
		@IConfigurationService private _configurationService: IConfigurationService
	) {
		super(
			localize('connection', "Connection"),
			TelemetryKeys.Connection,
			telemetryService,
			layoutService,
			clipboardService,
			themeService,
			logService,
			textResourcePropertiesService,
			contextKeyService,
			{ hasSpinner: true, spinnerTitle: localize('connecting', "Connecting"), hasErrors: true });

		const container = viewDescriptorService.getViewContainerById(VIEW_CONTAINER.id);
		if (!container) {
			throw new Error('Could not find container');
		}

		this.viewContainer = container;
		this.viewContainerModel = viewDescriptorService.getViewContainerModel(container);
	}
	getActionsContext(): unknown {
		throw new Error('Method not implemented.');
	}

	/**
	 * Update the available connection providers, this is called when new providers are registered
	 * So that the connection type dropdown always has up to date values
	 */
	public updateConnectionProviders(
		providerTypeDisplayNameOptions: string[],
		providerNameToDisplayNameMap: { [providerDisplayName: string]: string }) {
		this.providerDisplayNameOptions = providerTypeDisplayNameOptions;
		this.providerNameToDisplayNameMap = providerNameToDisplayNameMap;
		this.refresh();
	}

	public refresh(): void {
		let filteredProviderMap = this.providerNameToDisplayNameMap;
		if (this._newConnectionParams && this._newConnectionParams.providers) {
			const validProviderMap = entries(this.providerNameToDisplayNameMap).filter(x => this.includeProvider(x[0], this._newConnectionParams));
			if (validProviderMap && validProviderMap.length > 0) {
				let map: { [providerDisplayName: string]: string } = {};
				validProviderMap.forEach(v => {
					map[v[0]] = v[1];
				});
				filteredProviderMap = map;
			}
		}

		// Remove duplicate listings (CMS uses the same display name)
		let uniqueProvidersMap = this.connectionManagementService.getUniqueConnectionProvidersByNameMap(filteredProviderMap);
		this._providerTypeSelectBox.setOptions(Object.keys(uniqueProvidersMap).map(k => uniqueProvidersMap[k]));
	}

	private includeProvider(providerName: string, params?: INewConnectionParams): Boolean {
		return params === undefined || params.providers === undefined || params.providers.some(x => x === providerName);
	}

	protected renderBody(container: HTMLElement): void {
		this._body = DOM.append(container, DOM.$('.connection-dialog'));

		const connectTypeLabel = localize('connectType', "Connection type");
		this._providerTypeSelectBox = new SelectBox(this.providerDisplayNameOptions, this.selectedProviderType, this.contextViewService, undefined, { ariaLabel: connectTypeLabel });
		// Recent connection tab
		const recentConnectionTab = DOM.$('.connection-recent-tab');
		const recentConnectionContainer = DOM.append(recentConnectionTab, DOM.$('.connection-recent', { id: 'recentConnection' }));
		this._recentConnection = DOM.append(recentConnectionContainer, DOM.$('div'));
		this._recentConnection.style.height = '100%';
		this._noRecentConnection = DOM.append(recentConnectionContainer, DOM.$('div'));
		this.createRecentConnections();
		DOM.hide(this._recentConnection);

		// Saved connection tab
		const savedConnectionTab = DOM.$('.connection-saved-tab');
		const savedConnectionContainer = DOM.append(savedConnectionTab, DOM.$('.connection-saved'));
		this._savedConnection = DOM.append(savedConnectionContainer, DOM.$('div'));
		this._savedConnection.style.height = '100%';
		this._noSavedConnection = DOM.append(savedConnectionContainer, DOM.$('div'));
		this.createSavedConnections();
		DOM.hide(this._savedConnection);

		this._panel = new TabbedPanel(this._body);
		attachTabbedPanelStyler(this._panel, this._themeService);
		this._recentConnectionTabId = this._panel.pushTab({
			identifier: 'recent_connection',
			title: localize('recentConnectionTitle', "Recent Connections"),
			view: {
				render: c => {
					c.append(recentConnectionTab);
				},
				layout: () => { },
				focus: () => this._recentConnectionTree.domFocus()
			}
		});

		const savedConnectionTabId = this._panel.pushTab({
			identifier: 'saved_connection',
			title: localize('savedConnectionTitle', "Saved Connections"),
			view: {
				layout: () => { },
				render: c => {
					c.append(savedConnectionTab);
				},
				focus: () => this._savedConnectionTree.domFocus()
			}
		});

		this._panel.onTabChange(async c => {
			if (this._savedConnectionTree instanceof AsyncServerTree) {
				if (c === savedConnectionTabId && this._savedConnectionTree.contentHeight === 0) {
					// Update saved connection tree
					await TreeUpdateUtils.structuralTreeUpdate(this._savedConnectionTree, 'saved', this.connectionManagementService, this._providers);

					if (this._savedConnectionTree.contentHeight > 0) {
						DOM.hide(this._noSavedConnection);
						DOM.show(this._savedConnection);
					} else {
						DOM.show(this._noSavedConnection);
						DOM.hide(this._savedConnection);
					}
					this._savedConnectionTree.layout(DOM.getTotalHeight(this._savedConnectionTree.getHTMLElement()));
				}
			} else {
				// convert to old VS Code tree interface with expandable methods
				const expandableTree: IExpandableTree = <IExpandableTree>this._savedConnectionTree;

				if (c === savedConnectionTabId && expandableTree.getContentHeight() === 0) {
					// Update saved connection tree
					await TreeUpdateUtils.structuralTreeUpdate(this._savedConnectionTree, 'saved', this.connectionManagementService, this._providers);

					if (expandableTree.getContentHeight() > 0) {
						DOM.hide(this._noSavedConnection);
						DOM.show(this._savedConnection);
					} else {
						DOM.show(this._noSavedConnection);
						DOM.hide(this._savedConnection);
					}
					this._savedConnectionTree.layout(DOM.getTotalHeight(this._savedConnectionTree.getHTMLElement()));
				}
			}
		});

		this._connectionDetailTitle = DOM.append(this._body, DOM.$('.connection-details-title'));

		this._connectionDetailTitle.innerText = localize('connectionDetailsTitle', "Connection Details");

		const tableContainer = DOM.append(this._body, DOM.$('.connection-type'));
		const table = DOM.append(tableContainer, DOM.$('table.connection-table-content'));
		DialogHelper.appendInputSelectBox(
			DialogHelper.appendRow(table, connectTypeLabel, 'connection-label', 'connection-input'), this._providerTypeSelectBox);

		this._connectionUIContainer = DOM.$('.connection-provider-info', { id: 'connectionProviderInfo' });
		this._body.append(this._connectionUIContainer);

		this._register(this.viewContainerModel.onDidAddVisibleViewDescriptors(added => this.onDidAddViewDescriptors(added)));
		this._register(this.viewContainerModel.onDidRemoveVisibleViewDescriptors(removed => this.onDidRemoveViewDescriptors(removed)));
		const addedViews: IAddedViewDescriptorRef[] = this.viewContainerModel.visibleViewDescriptors.map((viewDescriptor, index) => {
			const size = this.viewContainerModel.getSize(viewDescriptor.id);
			const collapsed = this.viewContainerModel.isCollapsed(viewDescriptor.id);
			return ({ viewDescriptor, index, size, collapsed });
		});
		if (addedViews.length) {
			this.onDidAddViewDescriptors(addedViews);
		}

		this._register(this._themeService.onDidColorThemeChange(e => this.updateTheme(e)));
		this.updateTheme(this._themeService.getColorTheme());
	}

	/**
	 * Render the connection flyout
	 */
	public render() {
		super.render();
		attachModalDialogStyler(this, this._themeService);
		const connectLabel = localize('connectionDialog.connect', "Connect");
		const cancelLabel = localize('connectionDialog.cancel', "Cancel");
		this._connectButton = this.addFooterButton(connectLabel, () => this.connect());
		this._connectButton.enabled = false;
		this._closeButton = this.addFooterButton(cancelLabel, () => this.cancel());
		this.registerListeners();
		this.onProviderTypeSelected(this._providerTypeSelectBox.value);
	}

	// Update theming that is specific to connection flyout body
	private updateTheme(theme: IColorTheme): void {
		const borderColor = theme.getColor(contrastBorder);
		const border = borderColor ? borderColor.toString() : null;
		const backgroundColor = theme.getColor(SIDE_BAR_BACKGROUND);
		if (this._connectionDetailTitle) {
			this._connectionDetailTitle.style.borderWidth = border ? '1px 0px' : null;
			this._connectionDetailTitle.style.borderStyle = border ? 'solid none' : null;
			this._connectionDetailTitle.style.borderColor = border;
			this._connectionDetailTitle.style.backgroundColor = backgroundColor ? backgroundColor.toString() : null;
		}
	}

	private registerListeners(): void {
		// Theme styler
		this._register(styler.attachSelectBoxStyler(this._providerTypeSelectBox, this._themeService));
		this._register(attachButtonStyler(this._connectButton, this._themeService));
		this._register(attachButtonStyler(this._closeButton, this._themeService));

		this._register(this._providerTypeSelectBox.onDidSelect(selectedProviderType => {
			this.onProviderTypeSelected(selectedProviderType.selected);
		}));
	}

	private onProviderTypeSelected(selectedProviderDisplayName: string) {
		// Show connection form based on server type
		DOM.clearNode(this._connectionUIContainer);
		this._onShowUiComponent.fire({ selectedProviderDisplayName: selectedProviderDisplayName, container: this._connectionUIContainer });
		this.initDialog();
	}

	private connect(element?: IConnectionProfile): void {
		if (this._connectButton.enabled) {
			this._connecting = true;
			this._connectButton.enabled = false;
			this._providerTypeSelectBox.disable();
			this.spinner = true;
			this._onConnect.fire(element);
		}
	}

	/* Overwrite espace key behavior */
	protected onClose(e: StandardKeyboardEvent) {
		this.cancel();
	}

	/* Overwrite enter key behavior */
	protected onAccept(e: StandardKeyboardEvent) {
		if (!e.target.classList.contains('monaco-tree')) {
			this.connect();
		}
	}

	private cancel() {
		const wasConnecting = this._connecting;
		this._onCancel.fire();
		if (!this._databaseDropdownExpanded && !wasConnecting) {
			this.close();
		}
	}

	public close() {
		this.resetConnection();
		this.hide();
	}

	private createRecentConnectionList(): void {
		const recentConnectionContainer = DOM.append(this._recentConnection, DOM.$('.connection-recent-content'));
		const container = DOM.append(recentConnectionContainer, DOM.$('.recent-titles-container'));
		const actionsContainer = DOM.append(container, DOM.$('.connection-history-actions'));
		this._actionbar = this._register(new ActionBar(actionsContainer, { animated: false }));
		const clearAction = this.instantiationService.createInstance(ClearRecentConnectionsAction, ClearRecentConnectionsAction.ID, ClearRecentConnectionsAction.LABEL);
		clearAction.useConfirmationMessage = true;
		clearAction.onRecentConnectionsRemoved(() => this.open(false));
		this._actionbar.push(clearAction, { icon: true, label: true });
		const divContainer = DOM.append(recentConnectionContainer, DOM.$('.server-explorer-viewlet'));
		const treeContainer = DOM.append(divContainer, DOM.$('.explorer-servers'));
		const leftClick = (element: any, eventish: ICancelableEvent, origin: string) => {
			// element will be a server group if the tree is clicked rather than a item
			const isDoubleClick = origin === 'mouse' && (eventish as MouseEvent).detail === 2;
			this.onConnectionClick(element, isDoubleClick);
		};
		const actionProvider = this.instantiationService.createInstance(RecentConnectionActionsProvider);
		const controller = new RecentConnectionTreeController(leftClick, actionProvider, this.connectionManagementService, this.contextMenuService);
		actionProvider.onRecentConnectionRemoved(() => {
			const recentConnections: ConnectionProfile[] = this.connectionManagementService.getRecentConnections();
			this.open(recentConnections.length > 0).catch(err => this.logService.error(`Unexpected error opening connection widget after a recent connection was removed from action provider: ${err}`));
			// We're just using the connections to determine if there are connections to show, dispose them right after to clean up their handlers
			recentConnections.forEach(conn => conn.dispose());
		});
		controller.onRecentConnectionRemoved(() => {
			const recentConnections: ConnectionProfile[] = this.connectionManagementService.getRecentConnections();
			this.open(recentConnections.length > 0).catch(err => this.logService.error(`Unexpected error opening connection widget after a recent connection was removed from controller : ${err}`));
			// We're just using the connections to determine if there are connections to show, dispose them right after to clean up their handlers
			recentConnections.forEach(conn => conn.dispose());
		});
		this._recentConnectionTree = TreeCreationUtils.createConnectionTree(treeContainer, this.instantiationService, this._configurationService, localize('connectionDialog.recentConnections', "Recent Connections"), controller);
		if (this._recentConnectionTree instanceof AsyncServerTree) {
			this._recentConnectionTree.onMouseClick(e => {
				if (e.element instanceof ConnectionProfile) {
					this.onConnectionClick(e.element, false);
				}
			});
			this._recentConnectionTree.onMouseDblClick(e => {
				if (e.element instanceof ConnectionProfile) {
					this.onConnectionClick(e.element, true);
				}
			});
		}

		// Theme styler
		this._register(styler.attachListStyler(this._recentConnectionTree, this._themeService));
	}

	private createRecentConnections() {
		this.createRecentConnectionList();
		const noRecentConnectionContainer = DOM.append(this._noRecentConnection, DOM.$('.connection-recent-content'));
		const noRecentHistoryLabel = localize('noRecentConnections', "No recent connection");
		DOM.append(noRecentConnectionContainer, DOM.$('.no-recent-connections')).innerText = noRecentHistoryLabel;
	}

	private createSavedConnectionList(): void {
		const savedConnectioncontainer = DOM.append(this._savedConnection, DOM.$('.connection-saved-content'));
		const divContainer = DOM.append(savedConnectioncontainer, DOM.$('.server-explorer-viewlet'));
		const treeContainer = DOM.append(divContainer, DOM.$('.explorer-servers'));
		const leftClick = (element: any, eventish: ICancelableEvent, origin: string) => {
			// element will be a server group if the tree is clicked rather than a item
			const isDoubleClick = origin === 'mouse' && (eventish as MouseEvent).detail === 2;
			if (element instanceof ConnectionProfile) {
				this.onConnectionClick(element, isDoubleClick);
			}
		};

		const controller = new SavedConnectionTreeController(leftClick);
		this._savedConnectionTree = TreeCreationUtils.createConnectionTree(treeContainer, this.instantiationService, this._configurationService, localize('connectionDialog.savedConnections', "Saved Connections"), controller);
		if (this._savedConnectionTree instanceof AsyncServerTree) {
			this._savedConnectionTree.onMouseClick(e => {
				if (e.element instanceof ConnectionProfile) {
					this.onConnectionClick(e.element, false);
				}
			});
			this._savedConnectionTree.onMouseDblClick(e => {
				if (e.element instanceof ConnectionProfile) {
					this.onConnectionClick(e.element, true);
				}
			});
		}

		// Theme styler
		this._register(styler.attachListStyler(this._savedConnectionTree, this._themeService));
	}

	private createSavedConnections() {
		this.createSavedConnectionList();
		const noSavedConnectionContainer = DOM.append(this._noSavedConnection, DOM.$('.connection-saved-content'));
		const noSavedConnectionLabel = localize('noSavedConnections', "No saved connection");
		DOM.append(noSavedConnectionContainer, DOM.$('.no-saved-connections')).innerText = noSavedConnectionLabel;
	}

	private onConnectionClick(element: IConnectionProfile, connect: boolean = false): void {
		if (connect) {
			this.connect(element);
		} else {
			this._onFillinConnectionInputs.fire(element);
		}
	}

	/**
	 * Open the flyout dialog
	 * @param recentConnections Are there recent connections that should be shown
	 */
	public async open(recentConnections: boolean): Promise<void> {
		this._panel.showTab(this._recentConnectionTabId);

		this.show();
		if (recentConnections) {
			DOM.hide(this._noRecentConnection);
			DOM.show(this._recentConnection);
		} else {
			DOM.hide(this._recentConnection);
			DOM.show(this._noRecentConnection);
		}
		await TreeUpdateUtils.structuralTreeUpdate(this._recentConnectionTree, 'recent', this.connectionManagementService, this._providers);
		this._recentConnectionTree.layout(DOM.getTotalHeight(this._recentConnectionTree.getHTMLElement()));

		if (!(this._savedConnectionTree instanceof AsyncServerTree)) {
			// reset saved connection tree
			await this._savedConnectionTree.setInput([]);
		}

		// call layout with view height
		this.initDialog();
	}

	protected layout(height: number): void {
		// Height is the overall height. Since we're laying out a specific component, always get its actual height
		const width = DOM.getContentWidth(this._body);
		this.orthogonalSize = width;
		for (const { pane } of this.paneItems) {
			pane.orthogonalSize = width;
		}
		this._panel.layout(new DOM.Dimension(this.orthogonalSize, height - 38 - 35 - 326)); // height - connection title - connection type input - connection widget
	}

	/**
	 * Set the state of the connect button
	 * @param enabled The state to set the the button
	 */
	public set connectButtonState(enabled: boolean) {
		this._connectButton.enabled = enabled;
	}

	/**
	 * Get the connect button state
	 */
	public get connectButtonState(): boolean {
		return this._connectButton.enabled;
	}

	private initDialog(): void {
		super.setError('');
		this.spinner = false;
		this._onInitDialog.fire();
	}

	public resetConnection(): void {
		this.spinner = false;
		this._connectButton.enabled = true;
		this._providerTypeSelectBox.enable();
		this._onResetConnection.fire();
		this._connecting = false;
	}

	public get newConnectionParams(): INewConnectionParams {
		return this._newConnectionParams;
	}

	public set newConnectionParams(params: INewConnectionParams) {
		this._newConnectionParams = params;
		this._providers = params && params.providers;
		this.refresh();
	}

	public updateProvider(providerDisplayName: string) {
		this._providerTypeSelectBox.selectWithOptionName(providerDisplayName);

		this.onProviderTypeSelected(providerDisplayName);
	}

	public set databaseDropdownExpanded(val: boolean) {
		this._databaseDropdownExpanded = val;
	}

	public get databaseDropdownExpanded(): boolean {
		return this._databaseDropdownExpanded;
	}

	//#region ViewletContainer
	public readonly onDidAddViews: Event<IView[]> = Event.None;
	public readonly onDidRemoveViews: Event<IView[]> = Event.None;
	public readonly onDidChangeViewVisibility: Event<IView> = Event.None;
	public get views(): IView[] {
		return [];
	}

	setVisible(visible: boolean): void {
	}

	isVisible(): boolean {
		return true;
	}

	focus(): void {
	}

	getActions(): IAction[] {
		return [];
	}

	getSecondaryActions(): IAction[] {
		return [];
	}

	getActionViewItem(action: IAction): IActionViewItem {
		throw new Error('Method not implemented.');
	}

	getView(viewId: string): IView {
		throw new Error('Method not implemented.');
	}

	saveState(): void {
	}

	private onDidRemoveViewDescriptors(removed: IViewDescriptorRef[]): void {
		for (const ref of removed) {
			this.removePane(ref);
		}
	}

	private removePane(ref: IViewDescriptorRef): void {
		const item = this.paneItems.find(p => p.pane.id === ref.viewDescriptor.id);
		this._panel.removeTab(item.pane.id);
		dispose(item.disposable);
	}

	protected onDidAddViewDescriptors(added: IAddedViewDescriptorRef[]): ViewPane[] {
		const panesToAdd: { pane: ViewPane, size: number, treeView: ITreeView }[] = [];

		for (const { viewDescriptor, size } of added) {
			const treeViewDescriptor = viewDescriptor as ITreeViewDescriptor;
			const pane = this.createView(treeViewDescriptor,
				{
					id: viewDescriptor.id,
					title: viewDescriptor.name,
					expanded: true
				});

			pane.render();

			panesToAdd.push({ pane, size: size || pane.minimumSize, treeView: treeViewDescriptor.treeView as ITreeView });
		}

		this.addPanes(panesToAdd);

		const panes: ViewPane[] = [];
		for (const { pane } of panesToAdd) {
			pane.setVisible(this.isVisible());
			pane.headerVisible = false;
			panes.push(pane);
		}
		return panes;
	}

	protected createView(viewDescriptor: ITreeViewDescriptor, options: IViewletViewOptions): ViewPane {
		return (this.instantiationService as any).createInstance(viewDescriptor.ctorDescriptor.ctor, ...(viewDescriptor.ctorDescriptor.staticArguments || []), options) as ViewPane;
	}

	private addPanes(panes: { pane: ViewPane, treeView: ITreeView, size: number }[]): void {

		for (const { pane, treeView, size } of panes) {
			this.addPane({ pane, treeView }, size);
		}

		// this._onDidAddViews.fire(panes.map(({ pane }) => pane));
	}

	private addPane({ pane, treeView }: { pane: ViewPane, treeView: ITreeView }, size: number): void {
		const paneStyler = styler.attachStyler<IPaneColors>(this._themeService, {
			headerForeground: PANEL_SECTION_HEADER_FOREGROUND,
			headerBackground: PANEL_SECTION_HEADER_BACKGROUND,
			headerBorder: PANEL_SECTION_HEADER_BORDER,
			dropBackground: PANEL_SECTION_DRAG_AND_DROP_BACKGROUND,
			leftBorder: PANEL_SECTION_BORDER
		}, pane);

		const disposable = combinedDisposable(pane, paneStyler);
		const paneItem = { pane, disposable };
		treeView.onDidChangeSelection(e => {
			if (e.length > 0 && e[0].payload) {
				this.onConnectionClick(e[0].payload);
			}
		});

		this.paneItems.push(paneItem);
		this._panel.pushTab({
			identifier: pane.id,
			title: pane.title,
			view: {
				focus: () => pane.focus(),
				layout: d => pane.layout(d.height),
				render: e => e.appendChild(pane.element),
			}
		});
	}
	//#endregion
}

export const VIEW_CONTAINER = Registry.as<IViewContainersRegistry>(ViewContainerExtensions.ViewContainersRegistry).registerViewContainer({
	id: 'dialog/connection',
	name: 'ConnectionDialog',
	ctorDescriptor: new SyncDescriptor(class { }),
	order: 0,
	storageId: `dialog/connection.state`
}, ViewContainerLocation.Dialog);
