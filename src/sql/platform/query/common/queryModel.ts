/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the Source EULA. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import QueryRunner, { IQueryMessage } from 'sql/platform/query/common/queryRunner';
import { DataService } from 'sql/workbench/contrib/grid/common/dataService';
import { createDecorator } from 'vs/platform/instantiation/common/instantiation';
import { Event } from 'vs/base/common/event';
import { QueryInput } from 'sql/workbench/contrib/query/common/queryInput';
import {
	ISelectionData,
	ResultSetSubset,
	EditUpdateCellResult,
	EditSessionReadyParams,
	EditSubsetResult,
	EditCreateRowResult,
	EditRevertCellResult,
	ExecutionPlanOptions,
	queryeditor
} from 'azdata';
import { QueryInfo } from 'sql/platform/query/common/queryModelService';

export const SERVICE_ID = 'queryModelService';

export const IQueryModelService = createDecorator<IQueryModelService>(SERVICE_ID);

export interface IQueryPlanInfo {
	providerId: string;
	fileUri: string;
	planXml: string;
}

export interface IQueryInfo {
	selection: ISelectionData[];
	messages: IQueryMessage[];
}

export interface IQueryEvent {
	type: queryeditor.QueryEventType;
	uri: string;
	queryInfo: IQueryInfo;
	params?: any;
}

/**
 * Interface for the logic of handling running queries and grid interactions for all URIs.
 */
export interface IQueryModelService {
	_serviceBrand: undefined;

	getQueryRunner(uri: string): QueryRunner | undefined;

	getQueryRows(uri: string, rowStart: number, numberOfRows: number, batchId: number, resultId: number): Promise<ResultSetSubset | undefined>;
	runQuery(uri: string, selection: ISelectionData | undefined, queryInput: QueryInput, runOptions?: ExecutionPlanOptions): void;
	runQueryStatement(uri: string, selection: ISelectionData | undefined, queryInput: QueryInput): void;
	runQueryString(uri: string, selection: string | undefined, queryInput: QueryInput): void;
	cancelQuery(input: QueryRunner | string): void;
	disposeQuery(uri: string): void;
	isRunningQuery(uri: string): boolean;

	getDataService(uri: string): DataService;
	refreshResultsets(uri: string): void;
	sendGridContentEvent(uri: string, eventName: string): void;
	resizeResultsets(uri: string): void;
	onAngularLoaded(uri: string): void;

	copyResults(uri: string, selection: Slick.Range[], batchId: number, resultId: number, includeHeaders?: boolean): void;
	setEditorSelection(uri: string, index: number): void;
	showWarning(uri: string, message: string): void;
	showError(uri: string, message: string): void;
	showCommitError(error: string): void;

	onRunQueryStart: Event<string>;
	onRunQueryUpdate: Event<string>;
	onRunQueryComplete: Event<string>;
	onQueryEvent: Event<IQueryEvent>;

	// Edit Data Functions
	initializeEdit(ownerUri: string, schemaName: string, objectName: string, objectType: string, rowLimit: number, queryString: string): void;
	disposeEdit(ownerUri: string): Promise<void>;
	updateCell(ownerUri: string, rowId: number, columnId: number, newValue: string): Promise<EditUpdateCellResult | undefined>;
	commitEdit(ownerUri: string): Promise<void>;
	createRow(ownerUri: string): Promise<EditCreateRowResult | undefined>;
	deleteRow(ownerUri: string, rowId: number): Promise<void>;
	revertCell(ownerUri: string, rowId: number, columnId: number): Promise<EditRevertCellResult | undefined>;
	revertRow(ownerUri: string, rowId: number): Promise<void>;
	getEditRows(ownerUri: string, rowStart: number, numberOfRows: number): Promise<EditSubsetResult | undefined>;

	_getQueryInfo(uri: string): QueryInfo | undefined;
	// Edit Data Callbacks
	onEditSessionReady: Event<EditSessionReadyParams>;
}
