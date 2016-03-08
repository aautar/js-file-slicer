/**
 * Read a file in slices/chunks
 *
 *  @param {File} _file
 *  @param {function} _processSlice function to call to process a slice
 */
function FileSlicer(_file, _processSlice) {

    this.file = _file;
    this.processSlice = _processSlice;
    
    this.SLICE_SIZE = 1024;
    this.currentOffset = 0;

    this.fileReader = null;

    /**
     * Cut a slice of size SLICE_SIZE
     */
    this.cut = function() {
        var thisSlicer = this;

        var fileSlice = thisSlicer.file.slice(thisSlicer.currentOffset,
                                              thisSlicer.currentOffset + thisSlicer.SLICE_SIZE);

        thisSlicer.fileReader.readAsArrayBuffer(fileSlice);
    };

    /**
     * Process a slice, then move on to cut another slice
     *
     * @param {Uint8Array} _sliceData
     * @param {int} _sliceOffset
     * @param {int} _totalSize
     */
    this.process = function(_sliceData, _sliceOffset, _totalSize) {
        var thisSlicer = this;

        thisSlicer.currentOffset += thisSlicer.SLICE_SIZE;
        if(thisSlicer.currentOffset < thisSlicer.file.size) {
            thisSlicer.cut();
        }

        if(typeof thisSlicer.processSlice !== 'undefined') {
            thisSlicer.processSlice(_sliceData, _sliceOffset, _totalSize);
        }
    };

    /**
     * Run the slicer for the entire file
     */
    this.run = function() {

        var thisSlicer = this;

        thisSlicer.fileReader = new FileReader();
        thisSlicer.fileReader.onload = function(_event) {
            var thisFileReader = this;

            var sliceData = new Uint8Array(thisFileReader.result);
            thisSlicer.process(sliceData, thisSlicer.currentOffset, thisSlicer.file.size);
        };

        thisSlicer.cut();
    };
};