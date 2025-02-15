---
title: Showing status and link to details
---

This is an example of [Column formatting with JSON](https://support.office.com/client/results?helpid=WSSEndUser_ColumnFormatting&lcid=1033&locale=en-us&ns=SPOSTANDARD&omkt=en-us&version=16)

Here we build up links to the badge endpoint in order to show a sync status (red/yellow/green) and to provide and entry point for getting details and
visualisation of a given item

```json
{
	"$schema": "https://developer.microsoft.com/json-schemas/sp/column-formatting.schema.json",
	"elmType": "a",
	"attributes": {
		"href": {
			"operator": "+",
			"operands": [
				"https://nexi-intra-nexi-toolsv2-alpha.intra.nexigroup.com",
				"/badges/details",
				"?",
				"source=",
				"https://christianiabpos.sharepoint.com/sites/nexiintra-home/lists/all%20tools/",
				"id=",
				"[$ID]",
				"version=",
				"[$_UIVersionString]"
			]
		},
		"target": "_blank"
	},
	"children": [
		{
			"elmType": "img",
			"attributes": {
				"src": {
					"operator": "+",
					"operands": [
						"https://nexi-intra-nexi-toolsv2-alpha.intra.nexigroup.com",
						"/badges/sync-status",
						"?",
						"source=",
						"https://christianiabpos.sharepoint.com/sites/nexiintra-home/lists/all%20tools/",
						"id=",
						"[$ID]",
						"version=",
						"[$_UIVersionString]"
					]
				},
				"alt": "View Image"
			},
			"style": {
				"border-radius": "50%",
				"width": "24px",
				"height": "24px"
			}
		}
	]
}
```
