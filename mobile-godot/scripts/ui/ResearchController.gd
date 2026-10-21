extends Control
class_name ResearchController

@onready var query_input: LineEdit = $InputSection/QueryInput
@onready var search_btn: Button = $InputSection/SearchButton
@onready var status_lbl: Label = $StatusLabel
@onready var summary_label: Label = $ResultContainer/SummaryCard/SummaryText
@onready var findings_container: VBoxContainer = $ResultContainer/FindingsCard/FindingsList
@onready var sources_container: VBoxContainer = $ResultContainer/SourcesCard/SourcesList

func _ready() -> void:
	search_btn.pressed.connect(_on_search_pressed)
	query_input.text_submitted.connect(func(_t): _on_search_pressed())
	NetworkManager.research_completed.connect(_on_research_completed)
	$ResultContainer.visible = false

func _on_search_pressed() -> void:
	var q = query_input.text.strip_edges()
	if q == "":
		return
	
	status_lbl.text = "🔍 Searching verified web sources and synthesizing report..."
	search_btn.disabled = true
	$ResultContainer.visible = false
	NetworkManager.conduct_research(q)

func _on_research_completed(success: bool, report: Dictionary) -> void:
	search_btn.disabled = false
	if not success:
		status_lbl.text = "❌ Research failed or server unavailable. Please try again."
		return

	status_lbl.text = "✅ Research Complete!"
	$ResultContainer.visible = true
	summary_label.text = report.get("summary", "No summary generated.")

	# Render Key Findings
	for child in findings_container.get_children():
		child.queue_free()
	var findings = report.get("key_findings", [])
	for f in findings:
		var lbl = Label.new()
		lbl.text = "• " + str(f)
		lbl.autowrap_mode = TextServer.AUTOWRAP_WORD_SMART
		findings_container.add_child(lbl)

	# Render Clickable Verified Sources
	for child in sources_container.get_children():
		child.queue_free()
	var sources = report.get("sources", [])
	for s in sources:
		var btn = Button.new()
		var title = s.get("title", "Source Link")
		var url = s.get("url", "")
		btn.text = "🔗 " + title + "\n" + url
		btn.alignment = HORIZONTAL_ALIGNMENT_LEFT
		btn.pressed.connect(func():
			if url != "":
				OS.shell_open(url)
		)
		sources_container.add_child(btn)
