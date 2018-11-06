define(["jquery.min", "mxClient"], function(){

    var StateMachine = function () {
        var container = $("#graphContainer")[0];
        // Checks if the browser is supported
        if (!mxClient.isBrowserSupported())
        {
            // Displays an error message if the browser is not supported.
            mxUtils.error('Browser is not supported!', 200, false);
        }
        else
        {
            // Snaps to fixed points
            mxConstraintHandler.prototype.intersects = function(icon, point, source, existingEdge)
            {
                return (!source || existingEdge) || mxUtils.intersects(icon.bounds, point);
            };

            // Special case: Snaps source of new connections to fixed points
            // Without a connect preview in connectionHandler.createEdgeState mouseMove
            // and getSourcePerimeterPoint should be overriden by setting sourceConstraint
            // sourceConstraint to null in mouseMove and updating it and returning the
            // nearest point (cp) in getSourcePerimeterPoint (see below)
            var mxConnectionHandlerUpdateEdgeState = mxConnectionHandler.prototype.updateEdgeState;
            mxConnectionHandler.prototype.updateEdgeState = function(pt, constraint)
            {
                if (pt != null && this.previous != null)
                {
                    var constraints = this.graph.getAllConnectionConstraints(this.previous);
                    var nearestConstraint = null;
                    var dist = null;

                    for (var i = 0; i < constraints.length; i++)
                    {
                        var cp = this.graph.getConnectionPoint(this.previous, constraints[i]);

                        if (cp != null)
                        {
                            var tmp = (cp.x - pt.x) * (cp.x - pt.x) + (cp.y - pt.y) * (cp.y - pt.y);

                            if (dist == null || tmp < dist)
                            {
                                nearestConstraint = constraints[i];
                                dist = tmp;
                            }
                        }
                    }

                    if (nearestConstraint != null)
                    {
                        this.sourceConstraint = nearestConstraint;
                    }
                }

                mxConnectionHandlerUpdateEdgeState.apply(this, arguments);
            };

            var currentState = "";
            var statesVertex = {};
            var timer;

            var runButton = mxUtils.button('Run', function(evt)
            {
                document.getElementById("run").disabled = true;
                var edges = graph.getChildCells(graph.getDefaultParent(), false, true);
                graph.removeCells(edges);
                currentState = 1;
                //start state machine
                timer = setInterval(function(){
                    var nextState = currentState + 1;
                    if(currentState == 5){
                        nextState = 1;
                        var edges = graph.getChildCells(graph.getDefaultParent(), false, true);
                        var filtedEdges = [];
                        for(edge of edges){
                            if(edge.source.value != "State"+currentState){
                                filtedEdges.push(edge);
                            }
                        }
                        graph.removeCells(filtedEdges);
                    }
                    if(currentState == 1){
                        var edges = graph.getChildCells(graph.getDefaultParent(), false, true);
                        var filtedEdges = [];
                        for(edge of edges){
                            if(edge.source.value != "State"+currentState){
                                filtedEdges.push(edge);
                            }
                        }
                        graph.removeCells(filtedEdges);
                    }
                    var response = Math.round(Math.random());
                    var message = "Success";
                    if(response == 0){
                        message = "Fail";
                        document.getElementById("run").disabled = false;
                        document.getElementById("pause").disabled = true;
                        graph.insertEdge(parent, null, message, statesVertex["v"+currentState], statesVertex["v"+currentState], "");
                        clearInterval(timer);
                    }else{
                        document.getElementById("pause").disabled = false;
                        graph.insertEdge(parent, null, message, statesVertex["v"+currentState], statesVertex["v"+nextState], "");
                        currentState = nextState;
                    }

                }, 5000);
            });
            var runBtn = document.body.appendChild(runButton);
            runBtn.setAttribute("id", "run");

            var pauseButton = mxUtils.button('Pause', function(evt)
            {
                //pause state machine
                document.getElementById("pause").disabled = false;
                clearInterval(timer);
            });
            var pauseBtn = document.body.appendChild(pauseButton);
            pauseBtn.setAttribute("id", "pause");

            var nextButton = mxUtils.button('Next', function(evt)
            {
                //clear fail case
                var edges = graph.getChildCells(graph.getDefaultParent(), false, true);
                for(edge of edges){
                    if(edge.value == "Fail" && edge.source.value == "State"+currentState){
                        graph.removeCells([edge]);
                    }
                }
                //go to next state
                timer = setInterval(function(){
                    var nextState = currentState + 1;
                    if(currentState == 5){
                        nextState = 1;
                        var edges = graph.getChildCells(graph.getDefaultParent(), false, true);
                        var filtedEdges = [];
                        for(edge of edges){
                            if(edge.source.value != "State"+currentState){
                                filtedEdges.push(edge);
                            }
                        }
                        graph.removeCells(filtedEdges);
                    }
                    if(currentState == 1){
                        var edges = graph.getChildCells(graph.getDefaultParent(), false, true);
                        var filtedEdges = [];
                        for(edge of edges){
                            if(edge.source.value != "State"+currentState){
                                filtedEdges.push(edge);
                            }
                        }
                        graph.removeCells(filtedEdges);
                    }
                    var response = Math.round(Math.random());
                    var message = "Success";
                    if(response == 0){
                        message = "Fail";
                        document.getElementById("run").disabled = false;
                        document.getElementById("pause").disabled = true;
                        graph.insertEdge(parent, null, message, statesVertex["v"+currentState], statesVertex["v"+currentState], "");
                        clearInterval(timer);
                    }else{
                        document.getElementById("pause").disabled = false;
                        graph.insertEdge(parent, null, message, statesVertex["v"+currentState], statesVertex["v"+nextState], "");
                        currentState = nextState;
                    }
                }, 5000);
            });
            var nextBtn = document.body.appendChild(nextButton);
            nextBtn.setAttribute("id", "next");

            var resetButton = mxUtils.button('Reset', function(evt)
            {
                document.getElementById("run").disabled = false;
                var edges = graph.getChildCells(graph.getDefaultParent(), false, true);
                graph.removeCells(edges);
                //reset state machine
                clearInterval(timer);
            });
            var resetBtn = document.body.appendChild(resetButton);
            resetBtn.setAttribute("id", "reset");

            // Creates the graph inside the given container
            var graph = new mxGraph(container);
            graph.setConnectable(true);

            // Disables floating connections (only use with no connect image)
            if (graph.connectionHandler.connectImage == null)
            {
                graph.connectionHandler.isConnectableCell = function(cell)
                {
                    return false;
                };
                mxEdgeHandler.prototype.isConnectableCell = function(cell)
                {
                    return graph.connectionHandler.isConnectableCell(cell);
                };
            }

            graph.getAllConnectionConstraints = function(terminal)
            {
                if (terminal != null && this.model.isVertex(terminal.cell))
                {
                    return [new mxConnectionConstraint(new mxPoint(0, 0), true),
                        new mxConnectionConstraint(new mxPoint(0.5, 0), true),
                        new mxConnectionConstraint(new mxPoint(1, 0), true),
                        new mxConnectionConstraint(new mxPoint(0, 0.5), true),
                        new mxConnectionConstraint(new mxPoint(1, 0.5), true),
                        new mxConnectionConstraint(new mxPoint(0, 1), true),
                        new mxConnectionConstraint(new mxPoint(0.5, 1), true),
                        new mxConnectionConstraint(new mxPoint(1, 1), true)];
                }
                return null;
            };

            // Connect preview
            graph.connectionHandler.createEdgeState = function(me)
            {
                var edge = graph.createEdge(null, null, null, null, null, 'edgeStyle=orthogonalEdgeStyle');

                return new mxCellState(this.graph.view, edge, this.graph.getCellStyle(edge));
            };

            // Enables rubberband selection
            new mxRubberband(graph);

            // Gets the default parent for inserting new cells. This
            // is normally the first child of the root (ie. layer 0).
            var parent = graph.getDefaultParent();

            // Adds cells to the model in a single step
            graph.getModel().beginUpdate();
            try
            {
                statesVertex["v1"] = graph.insertVertex(parent, null, 'State1', 20, 20, 80, 30);
                statesVertex["v2"] = graph.insertVertex(parent, null, 'State2', 60, 150, 80, 30);
                statesVertex["v3"] = graph.insertVertex(parent, null, 'State3', 250, 20, 80, 30);
                statesVertex["v4"] = graph.insertVertex(parent, null, 'State4', 400, 80, 80, 30);
                statesVertex["v5"] = graph.insertVertex(parent, null, 'State5', 380, 220, 80, 30);
            }
            finally
            {
                // Updates the display
                graph.getModel().endUpdate();
            }
        }
    };

    StateMachine.prototype.constructor = StateMachine;

    new StateMachine();

    return StateMachine;
});
