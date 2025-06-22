/**
 * Grist Grid Widget
 * Displays Grist table data in a customizable grid format
 */

class GristGridWidget {
    constructor() {
        // Widget state
        this.records = [];
        this.mappings = null;
        this.selectedRecordId = null;
        
        // DOM elements
        this.elements = {
            configPanel: document.getElementById('configPanel'),
            loadingState: document.getElementById('loadingState'),
            emptyState: document.getElementById('emptyState'),
            gridTable: document.getElementById('gridTable'),
            gridHeader: document.getElementById('gridHeader'),
            gridBody: document.getElementById('gridBody')
        };
        
        this.init();
    }
    
    /**
     * Initialize the widget
     */
    init() {
        this.initializeGrist();
    }
    
    /**
     * Initialize Grist API connection with column mapping
     */
    initializeGrist() {
        // Initialize with column mapping for required and optional columns
        grist.ready({
            requiredAccess: 'read table',
            allowSelectBy: true,
            columns: [
                {
                    name: 'Row',
                    title: 'Row Column',
                    description: 'Column that determines the grid rows',
                    optional: false
                },
                {
                    name: 'Column', 
                    title: 'Column Column',
                    description: 'Column that determines the grid columns',
                    optional: false
                },
                {
                    name: 'Content',
                    title: 'Content Column', 
                    description: 'Column that provides the cell content',
                    optional: false
                },
                {
                    name: 'RowOrder',
                    title: 'Row Order Column',
                    description: 'Optional: numeric column to control row ordering',
                    optional: true,
                    type: 'Numeric'
                },
                {
                    name: 'ColumnOrder',
                    title: 'Column Order Column',
                    description: 'Optional: numeric column to control column ordering', 
                    optional: true,
                    type: 'Numeric'
                }
            ]
        });
        
        // Listen for data changes with mapped columns
        grist.onRecords((records, mappings) => {
            this.records = records || [];
            this.mappings = mappings;
            this.handleDataUpdate();
        });
        
        // Listen for cursor position changes (current record selection)
        grist.onRecord((record) => {
            if (record && record.id) {
                this.selectedRecordId = record.id;
                this.updateSelection();
            } else {
                this.selectedRecordId = null;
                this.updateSelection();
            }
        });
    }
    
    /**
     * Handle data updates from Grist
     */
    handleDataUpdate() {
        this.updateGrid();
    }
    
    /**
     * Update the grid display
     */
    updateGrid() {
        // Hide loading state
        this.elements.loadingState.style.display = 'none';
        
        // Check if we have column mappings
        if (!this.mappings) {
            this.showConfigPanel(true);
            this.showEmptyState('Waiting for column mappings...');
            return;
        }
        
        // Get mapped column names using Grist's mapping utility
        const mapped = grist.mapColumnNames(this.records[0] || {});
        if (!mapped || !this.hasRequiredMappings(mapped)) {
            this.showConfigPanel(true);
            this.showEmptyState('Please configure the column mappings in the widget settings panel.');
            return;
        }
        
        // Hide config panel when mappings are complete
        this.showConfigPanel(false);
        
        // Check if we have data
        if (this.records.length === 0) {
            this.showEmptyState('No data available in the selected table.');
            return;
        }
        
        this.buildGrid();
    }
    
    /**
     * Show or hide the configuration panel
     */
    showConfigPanel(show) {
        this.elements.configPanel.style.display = show ? 'block' : 'none';
    }
    
    /**
     * Check if all required column mappings are available
     */
    hasRequiredMappings(mapped) {
        return mapped.Row !== undefined && 
               mapped.Column !== undefined && 
               mapped.Content !== undefined;
    }
    
    /**
     * Show empty state with custom message
     */
    showEmptyState(message = 'No data to display') {
        this.elements.emptyState.style.display = 'block';
        this.elements.gridTable.style.display = 'none';
        
        // Update the empty state message
        const messageElement = this.elements.emptyState.querySelector('.empty-state-message');
        if (messageElement) {
            messageElement.textContent = message;
        }
    }
    
    /**
     * Build the grid from data
     */
    buildGrid() {
        this.elements.emptyState.style.display = 'none';
        this.elements.gridTable.style.display = 'table';
        
        // Process data into grid structure
        const gridData = this.processDataForGrid();
        
        // Build grid HTML
        this.renderGrid(gridData);
    }
    
    /**
     * Process records into grid structure using mapped columns
     */
    processDataForGrid() {
        // Collect row and column values with their ordering information
        const rowData = new Map(); // rowValue -> {order: number, value: string}
        const columnData = new Map(); // colValue -> {order: number, value: string}
        
        // Group records by grid position and store record IDs for linking
        const cellData = new Map(); // cellKey -> [{content: string, recordId: number}]
        
        this.records.forEach(record => {
            // Use Grist's column mapping to get the correct field values
            const mapped = grist.mapColumnNames(record);
            if (!mapped || !this.hasRequiredMappings(mapped)) {
                return;
            }
            
            const rowValue = this.getFieldValue(mapped.Row);
            const colValue = this.getFieldValue(mapped.Column);
            const content = this.getFieldValue(mapped.Content);
            
            // Skip records with missing row or column values (but allow empty content)
            if (rowValue == null || colValue == null || rowValue === '' || colValue === '') {
                return;
            }
            
            // Get ordering values (optional)
            const rowOrder = mapped.RowOrder != null ? Number(mapped.RowOrder) : null;
            const colOrder = mapped.ColumnOrder != null ? Number(mapped.ColumnOrder) : null;
            
            // Store row data with ordering
            if (!rowData.has(rowValue)) {
                rowData.set(rowValue, {
                    value: rowValue,
                    order: rowOrder
                });
            } else if (rowOrder != null && !isNaN(rowOrder)) {
                // Update order if we have a valid numeric order and none was set before
                const existing = rowData.get(rowValue);
                if (existing.order == null) {
                    existing.order = rowOrder;
                }
            }
            
            // Store column data with ordering
            if (!columnData.has(colValue)) {
                columnData.set(colValue, {
                    value: colValue,
                    order: colOrder
                });
            } else if (colOrder != null && !isNaN(colOrder)) {
                // Update order if we have a valid numeric order and none was set before
                const existing = columnData.get(colValue);
                if (existing.order == null) {
                    existing.order = colOrder;
                }
            }
            
            // Create cell key
            const cellKey = `${rowValue}|${colValue}`;
            
            if (!cellData.has(cellKey)) {
                cellData.set(cellKey, []);
            }
            
            // Store content with record ID for linking functionality
            cellData.get(cellKey).push({
                content: content || '',
                recordId: record.id
            });
        });
        
        // Sort rows and columns
        const sortedRows = this.sortDataWithOrder(Array.from(rowData.values()));
        const sortedColumns = this.sortDataWithOrder(Array.from(columnData.values()));
        
        return {
            rows: sortedRows.map(item => item.value),
            columns: sortedColumns.map(item => item.value),
            cellData: cellData
        };
    }
    
    /**
     * Sort data array considering optional order values
     */
    sortDataWithOrder(dataArray) {
        return dataArray.sort((a, b) => {
            // If both have order values, sort by order
            if (a.order != null && b.order != null && !isNaN(a.order) && !isNaN(b.order)) {
                return a.order - b.order;
            }
            // If only one has order, prioritize it
            if (a.order != null && !isNaN(a.order) && (b.order == null || isNaN(b.order))) {
                return -1;
            }
            if (b.order != null && !isNaN(b.order) && (a.order == null || isNaN(a.order))) {
                return 1;
            }
            // Otherwise sort alphabetically by value
            return String(a.value).localeCompare(String(b.value));
        });
    }
    
    /**
     * Get field value, handling different data types
     */
    getFieldValue(value) {
        // Handle null/undefined
        if (value == null) return null;
        
        // Handle reference fields (which might be objects)
        if (typeof value === 'object' && value.name) {
            return value.name;
        }
        
        // Handle arrays (reference lists)
        if (Array.isArray(value)) {
            return value.map(item => 
                typeof item === 'object' && item.name ? item.name : String(item)
            ).join(', ');
        }
        
        return String(value);
    }
    
    /**
     * Render the grid HTML
     */
    renderGrid(gridData) {
        const { rows, columns, cellData } = gridData;
        
        // Build header
        this.elements.gridHeader.innerHTML = '';
        const headerRow = document.createElement('tr');
        
        // Empty top-left cell
        const emptyHeader = document.createElement('th');
        emptyHeader.textContent = '';
        headerRow.appendChild(emptyHeader);
        
        // Column headers
        columns.forEach(colValue => {
            const th = document.createElement('th');
            th.textContent = colValue;
            headerRow.appendChild(th);
        });
        
        this.elements.gridHeader.appendChild(headerRow);
        
        // Build body
        this.elements.gridBody.innerHTML = '';
        
        rows.forEach(rowValue => {
            const row = document.createElement('tr');
            
            // Row header
            const rowHeader = document.createElement('th');
            rowHeader.textContent = rowValue;
            row.appendChild(rowHeader);
            
            // Data cells
            columns.forEach(colValue => {
                const cell = document.createElement('td');
                cell.className = 'grid-cell';
                
                const cellKey = `${rowValue}|${colValue}`;
                const cellItems = cellData.get(cellKey) || [];
                
                if (cellItems.length > 0) {
                    cell.classList.add('has-content');
                    
                    // Add content
                    const contentDiv = document.createElement('div');
                    contentDiv.className = 'cell-content';
                    
                    cellItems.forEach((item, index) => {
                        const itemDiv = document.createElement('div');
                        itemDiv.className = 'cell-item';
                        itemDiv.style.cursor = 'pointer';
                        itemDiv.dataset.recordId = item.recordId; // Store record ID for selection tracking
                        
                        // Apply selection styling if this is the selected record
                        if (this.selectedRecordId === item.recordId) {
                            itemDiv.classList.add('selected');
                        }
                        
                        // Display content, showing placeholder for empty content
                        if (item.content === null || item.content === undefined || item.content === '') {
                            itemDiv.textContent = '—';
                            itemDiv.style.color = '#adb5bd';
                            itemDiv.style.fontStyle = 'italic';
                        } else {
                            itemDiv.textContent = item.content;
                        }
                        
                        // Add click handler for linking functionality
                        itemDiv.addEventListener('click', (e) => {
                            e.stopPropagation();
                            this.selectRecord(item.recordId);
                        });
                        
                        contentDiv.appendChild(itemDiv);
                    });
                    
                    cell.appendChild(contentDiv);
                    
                    // Add count badge if multiple items
                    if (cellItems.length > 1) {
                        const countBadge = document.createElement('span');
                        countBadge.className = 'cell-count';
                        countBadge.textContent = cellItems.length;
                        cell.appendChild(countBadge);
                    }
                }
                
                row.appendChild(cell);
            });
            
            this.elements.gridBody.appendChild(row);
        });
    }
    
    /**
     * Select a record in Grist (linking functionality)
     */
    selectRecord(recordId) {
        try {
            // Update selected record state
            this.selectedRecordId = recordId;
            
            // Update visual selection in the grid
            this.updateSelection();
            
            // Set cursor position in Grist
            grist.setCursorPos({ rowId: recordId });
        } catch (error) {
            console.warn('Could not select record:', error);
        }
    }
    
    /**
     * Update visual selection in the grid
     */
    updateSelection() {
        // Remove selection from all items
        const allItems = this.elements.gridTable.querySelectorAll('.cell-item');
        allItems.forEach(item => {
            item.classList.remove('selected');
        });
        
        // Add selection to the selected record
        if (this.selectedRecordId) {
            const selectedItems = this.elements.gridTable.querySelectorAll(`[data-record-id="${this.selectedRecordId}"]`);
            selectedItems.forEach(item => {
                item.classList.add('selected');
            });
        }
    }
}

// Initialize the widget when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    new GristGridWidget();
});
