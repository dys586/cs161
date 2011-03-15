// Constructor object
var StemVille = function(in_delay, in_elementId) {
    return {
	    iter: 1,
    	max_iter: null, // null for indefinite looping.. if you set a value, it will stop fetching data at that iteration
    	delay: in_delay,
    	intid: null,
    	dataStore: [],
    	plotOptions: {
    	    title: "Real-time plotting",
    	    elementId: in_elementId,
    	    min_x: 0,
    	    min_y: 0,
    	    plot_x: "iteration",
    	    plot_y: "SA-06-G040001",
    	    label_x: 'days',
    	    label_y: 'disease spread? -- SA-06-G040001',	    
    	},
    	start: function() {
    		this.execute();
    	},
    	stop: function() {
    		if (this.intid) {
    			clearInterval(this.intid);
    			this.intid = null;
    		}
    	},
    	toggle: function() {
    		if (this.intid) {
    			this.stop();
    		} else {
    			this.start();
    		}
    	},
    	reset: function() {
    		this.stop();
    		this.iter = 1;
    		this.dataStore = [];
		
    		this.render();
    	},
    	setDelay: function(delay) {
    	    this.delay = delay;
    	},
    	iterate: function() {
    		this.iter++;
    	},
    	execute: function() {
    	    if (this.max_iter && this.iter >= this.max_iter) {
    	        this.stop();
    	        return;
            }
    		var that = this;
            $.ajax({
                url: "getdata.php",
                data: "iter="+that.iter,
                timeout: 30000,
                success: function(data){
                    var output = jQuery.parseJSON(data); 
                    if (!output.error) {
                        //that.dataStore[that.iter] = output;
                        that.dataStore.push(output);
                        that.iterate();
                        //document.write(output.iteration+"<br/>");
                        that.render();
                    }
                },
                complete: function() {
                    // Good scope exercise :)
                    that.intid = setTimeout(function() { that.execute(); }, that.delay);
                }
             });
		
    	},
    	render: function() {
    	    // Render a pretty graph
            // Construct plot array based on our current data
            // Use options from plotOptions


            var arr = [];
            var len = this.dataStore.length;
            for (var i=0; i < len; i++) {
                var obj = this.dataStore[i];
                arr.push(Array(obj[this.plotOptions.plot_x], obj[this.plotOptions.plot_y]));
            }
            
            var that = this;
            $('#'+this.plotOptions.elementId).html('');
            $.jqplot(this.plotOptions.elementId,  [arr], {
                title:that.plotOptions.title,
                axes: {
                    yaxis: { 
                        autoscale:true,
                        tickOptions:{formatString:'%d'},
                        min: that.plotOptions.min_y,
                        label: that.plotOptions.label_y,
                        labelRenderer: $.jqplot.CanvasAxisLabelRenderer,
                    },
                    xaxis: {
                        autoscale:true,
                        tickOptions:{formatString:'%d'},
                        min: that.plotOptions.min_x,
                        label: that.plotOptions.label_x,
                        labelRenderer: $.jqplot.CanvasAxisLabelRenderer,
                    }
                },
                series: [{color: '#5FAB78'}],
                highlighter: {sizeAdjust: 7.5, show:true},
                cursor: {show: true},
            });
    	},
    }
};