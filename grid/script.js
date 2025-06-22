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
        this.setupMarkdown();
        this.initializeGrist();
    }
    
    /**
     * Setup Markdown configuration
     */
    setupMarkdown() {
        if (typeof marked !== 'undefined') {
            // Configure marked for safe rendering
            marked.setOptions({
                breaks: true,
                gfm: true,
                sanitize: false, // We'll handle XSS protection manually
                smartLists: true,
                smartypants: false
            });
        }
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
                    name: 'VerticalAxis',
                    title: 'Vertical Axis',
                    description: 'Column that determines the vertical axis (rows) of the grid',
                    optional: false
                },
                {
                    name: 'HorizontalAxis', 
                    title: 'Horizontal Axis',
                    description: 'Column that determines the horizontal axis (columns) of the grid',
                    optional: false
                },
                {
                    name: 'Content',
                    title: 'Content', 
                    description: 'Column that provides the cell content',
                    optional: false
                },
                {
                    name: 'VerticalOrder',
                    title: 'Vertical Order',
                    description: 'Optional: numeric column to control vertical axis ordering',
                    optional: true,
                    type: 'Numeric'
                },
                {
                    name: 'HorizontalOrder',
                    title: 'Horizontal Order',
                    description: 'Optional: numeric column to control horizontal axis ordering', 
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
        
        // Check if we have column mappings and required mappings
        if (!this.mappings || this.records.length === 0) {
            this.showEmptyState('No data available or mappings not configured.');
            return;
        }
        
        // Get mapped column names using Grist's mapping utility
        const mapped = grist.mapColumnNames(this.records[0] || {});
        if (!mapped || !this.hasRequiredMappings(mapped)) {
            this.showEmptyState('Column mappings are being configured...');
            return;
        }
        
        this.buildGrid();
    }
    
    /**
     * Check if all required column mappings are available
     */
    hasRequiredMappings(mapped) {
        return mapped.VerticalAxis !== undefined && 
               mapped.HorizontalAxis !== undefined && 
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
            
            const rowValue = this.getFieldValue(mapped.VerticalAxis);
            const colValue = this.getFieldValue(mapped.HorizontalAxis);
            const content = this.getFieldValue(mapped.Content);
            
            // Skip records with missing row or column values (but allow empty content)
            if (rowValue == null || colValue == null || rowValue === '' || colValue === '') {
                return;
            }
            
            // Get ordering values (optional)
            const rowOrder = mapped.VerticalOrder != null ? Number(mapped.VerticalOrder) : null;
            const colOrder = mapped.HorizontalOrder != null ? Number(mapped.HorizontalOrder) : null;
            
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
        
        // Analyze column data types for alignment
        const columnAlignments = this.analyzeColumnAlignments(columns, cellData);
        
        // Build header
        this.elements.gridHeader.innerHTML = '';
        const headerRow = document.createElement('tr');
        
        // Empty top-left cell
        const emptyHeader = document.createElement('th');
        emptyHeader.textContent = '';
        headerRow.appendChild(emptyHeader);
        
        // Column headers
        columns.forEach((colValue, index) => {
            const th = document.createElement('th');
            th.textContent = colValue;
            // Apply alignment to header based on content
            if (columnAlignments[index] === 'right') {
                th.style.textAlign = 'right';
            }
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
            columns.forEach((colValue, colIndex) => {
                const cell = document.createElement('td');
                cell.className = 'grid-cell';
                
                // Apply column alignment
                if (columnAlignments[colIndex] === 'right') {
                    cell.style.textAlign = 'right';
                }
                
                const cellKey = `${rowValue}|${colValue}`;
                const cellItems = cellData.get(cellKey) || [];
                
                if (cellItems.length > 0) {
                    cell.classList.add('has-content');
                    
                    // Add content container
                    const contentDiv = document.createElement('div');
                    contentDiv.className = 'cell-content';
                    
                    // Add hover handlers for default selection
                    contentDiv.addEventListener('mouseenter', () => {
                        // Add default hover to last item
                        const lastItem = contentDiv.querySelector('.cell-item:last-child');
                        if (lastItem) {
                            lastItem.classList.add('hover-default');
                        }
                    });
                    
                    contentDiv.addEventListener('mouseleave', () => {
                        // Remove default hover from all items
                        const items = contentDiv.querySelectorAll('.cell-item');
                        items.forEach(item => item.classList.remove('hover-default'));
                    });
                    
                    // Add click handler to content div for default selection (last item)
                    contentDiv.addEventListener('click', (e) => {
                        // Only handle clicks that are directly on the content div (empty space)
                        if (e.target === contentDiv) {
                            e.stopPropagation();
                            // Select the last item by default when clicking on empty space
                            const lastItem = cellItems[cellItems.length - 1];
                            if (lastItem) {
                                this.selectRecord(lastItem.recordId);
                            }
                        }
                    });
                    
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
                            // Render content as Markdown if it's a string
                            this.renderContent(itemDiv, item.content);
                        }
                        
                        // Add hover handlers to remove default hover when hovering specific items
                        itemDiv.addEventListener('mouseenter', () => {
                            // Remove default hover from all items in this content
                            const items = contentDiv.querySelectorAll('.cell-item');
                            items.forEach(item => item.classList.remove('hover-default'));
                        });
                        
                        // Add click handler for linking functionality
                        itemDiv.addEventListener('click', (e) => {
                            e.stopPropagation();
                            this.selectRecord(item.recordId);
                        });
                        
                        contentDiv.appendChild(itemDiv);
                    });
                    
                    cell.appendChild(contentDiv);
                }
                
                row.appendChild(cell);
            });
            
            this.elements.gridBody.appendChild(row);
        });
    }
    
    /**
     * Analyze column data types to determine alignment
     */
    analyzeColumnAlignments(columns, cellData) {
        const alignments = {};
        
        columns.forEach((colValue, colIndex) => {
            let numericCount = 0;
            let totalCount = 0;
            
            // Check all cells in this column
            cellData.forEach((cellItems, cellKey) => {
                const [rowValue, currentColValue] = cellKey.split('|');
                if (currentColValue === colValue) {
                    cellItems.forEach(item => {
                        if (item.content && item.content !== '') {
                            totalCount++;
                            // Check if content is numeric
                            const content = String(item.content).trim();
                            if (!isNaN(content) && !isNaN(parseFloat(content)) && content !== '') {
                                numericCount++;
                            }
                        }
                    });
                }
            });
            
            // If all non-empty content is numeric, align right
            alignments[colIndex] = (totalCount > 0 && numericCount === totalCount) ? 'right' : 'left';
        });
        
        return alignments;
    }
    
    /**
     * Render content as Markdown if it's a string, otherwise as plain text
     */
    renderContent(element, content) {
        const contentStr = String(content);
        
        // Check if marked library is available and content looks like it might contain Markdown
        if (typeof marked !== 'undefined' && this.looksLikeMarkdown(contentStr)) {
            try {
                // Parse and render as Markdown
                const htmlContent = marked.parse(contentStr);
                element.innerHTML = this.sanitizeHtml(htmlContent);
            } catch (error) {
                console.warn('Error parsing Markdown:', error);
                // Fallback to plain text
                element.textContent = contentStr;
            }
        } else {
            // Render as plain text
            element.textContent = contentStr;
        }
    }
    
    /**
     * Check if content looks like it might contain Markdown
     */
    looksLikeMarkdown(content) {
        // Simple heuristics to detect potential Markdown content
        const markdownIndicators = [
            /\*\*.*\*\*/, // Bold
            /\*.*\*/, // Italic
            /^#{1,6}\s/, // Headers
            /^\s*[-*+]\s/, // Lists
            /^\s*\d+\.\s/, // Numbered lists
            /`.*`/, // Inline code
            /\[.*\]\(.*\)/, // Links
            /^>\s/, // Blockquotes
        ];
        
        return markdownIndicators.some(pattern => pattern.test(content));
    }
    
    /**
     * Basic HTML sanitization to prevent XSS
     */
    sanitizeHtml(html) {
        // Create a temporary div to parse HTML
        const temp = document.createElement('div');
        temp.innerHTML = html;
        
        // Remove script tags and event handlers
        const scripts = temp.querySelectorAll('script');
        scripts.forEach(script => script.remove());
        
        // Remove dangerous attributes
        const allElements = temp.querySelectorAll('*');
        allElements.forEach(el => {
            Array.from(el.attributes).forEach(attr => {
                if (attr.name.startsWith('on') || attr.name === 'javascript:') {
                    el.removeAttribute(attr.name);
                }
            });
        });
        
        return temp.innerHTML;
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
