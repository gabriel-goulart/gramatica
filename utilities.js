$( document ).ready(function() {
   // grammar functions
   window.workspace = new Workspace;

   // add action button
   $("#adicionar_gramatica_btn").click(function() {
		//alert('aqui');
        workspace.addGrammar($("#textGrammar").val());
 	});
  
});


window.Workspace = function() {
	// atributes
	this.addedGrammars = [];
	this.grammarId = 0;	
	
	// add grammar function
	this.addGrammar = function(grammar){
		//alert(grammar);
		// verifying grammar
		if ("string" == typeof grammar) {
            if ("" == grammar.trim()) return void this.error("A gramática não pode ser vázia");
            try {
            	//creating a new grammar
                n = new Grammar(grammar)
            } catch (r) {
                
            }
            // adding the new grammar to the list of added grammars
            this.addedGrammars[this.grammarId] = n;
            // rendering on interface            
            this.grammarInterface(this.grammarId);
            //updating grammarId
            this.grammarId ++;
           
        } 
	}

	// removing grammar
	this.close_grammar = function(element){
		alert(element.id);
		$("#table_"+element.id).remove();
		this.addedGrammars.splice(element.id,1);
		console.log(this.addedGrammars);
		//console.log($("#"+element.id).parent().parent().parent().parent().attr('id'));
	}

	// printing on interface the grammar
	this.grammarInterface = function(grammarId){
		var table = "<table class='grammar_data' id=table_"+grammarId+">" + 
					"<tr> <td> Gramática - "+ grammarId +"</td></tr>" +
					"<tr> <td> <button class='btn btn-danger' id="+grammarId+" onclick='workspace.close_grammar(this)'> X </button> <button class='btn btn-success' id='first_grammar_btn'> First </button> <button class='btn btn-success' id='follow_grammar_btn'> Follow </button></td></tr>" +
					"<tr> <td>"+this.addedGrammars[grammarId] +"</td> </tr>" +
					"</table>";
		$('#grammar_dados').append(table);
	}
	// error function
	this.error = function(error){
		alert(error);
	}
}

// grammar functions
window.Grammar = function(grammar){
	this.grammarString = grammar;

	this.toString = function(){
		return this.grammarString;
	}
}