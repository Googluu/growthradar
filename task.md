Este es el json que genero la auditoria para CrUX

```json
{
    "origin": "https://mercadolibre.com",
    "metrics": {
        "first_contentful_paint": {
            "p75": 623,
            "unit": "ms",
            "rating": "good"
        },
        "cumulative_layout_shift": {
            "p75": 0.04,
            "unit": "score",
            "rating": "good"
        },
        "largest_contentful_paint": {
            "p75": 782,
            "unit": "ms",
            "rating": "good"
        },
        "interaction_to_next_paint": {
            "p75": 22,
            "unit": "ms",
            "rating": "good"
        },
        "experimental_time_to_first_byte": {
            "p75": 576,
            "unit": "ms",
            "rating": "good"
        }
    },
    "form_factor": "DESKTOP",
    "collection_period": {
        "to": "2026-05-20",
        "from": "2026-04-23"
    },
    "performance_score": 100
}
```

Este es el JSON que me genera en API de CrUX developer chrome
```json
{
  "record": {
    "key": {
      "origin": "https://mercadolibre.com"
    },
    "metrics": {
      "largest_contentful_paint_image_resource_load_delay": {
        "percentiles": {
          "p75": 316
        }
      },
      "largest_contentful_paint_image_resource_load_duration": {
        "percentiles": {
          "p75": 47
        }
      },
      "largest_contentful_paint_resource_type": {
        "fractions": {
          "image": 0.9701,
          "text": 0.0299
        }
      },
      "navigation_types": {
        "fractions": {
          "prerender": 0.2639,
          "navigate": 0.4467,
          "navigate_cache": 0.199,
          "reload": 0.0188,
          "restore": 0.001,
          "back_forward": 0.0162,
          "back_forward_cache": 0.0545
        }
      },
      "round_trip_time": {
        "histogram": [
          {
            "start": 0,
            "end": 75,
            "density": 0.4518
          },
          {
            "start": 75,
            "end": 275,
            "density": 0.482
          },
          {
            "start": 275,
            "density": 0.0661
          }
        ],
        "percentiles": {
          "p75": 126
        }
      },
      "cumulative_layout_shift": {
        "histogram": [
          {
            "start": "0.00",
            "end": "0.10",
            "density": 0.9963
          },
          {
            "start": "0.10",
            "end": "0.25",
            "density": 0.0034
          },
          {
            "start": "0.25",
            "density": 0.0003
          }
        ],
        "percentiles": {
          "p75": "0.00"
        }
      },
      "experimental_time_to_first_byte": {
        "histogram": [
          {
            "start": 0,
            "end": 800,
            "density": 0.8352
          },
          {
            "start": 800,
            "end": 1800,
            "density": 0.1131
          },
          {
            "start": 1800,
            "density": 0.0517
          }
        ],
        "percentiles": {
          "p75": 604
        }
      },
      "first_contentful_paint": {
        "histogram": [
          {
            "start": 0,
            "end": 1800,
            "density": 0.9393
          },
          {
            "start": 1800,
            "end": 3000,
            "density": 0.0391
          },
          {
            "start": 3000,
            "density": 0.0216
          }
        ],
        "percentiles": {
          "p75": 765
        }
      },
      "interaction_to_next_paint": {
        "histogram": [
          {
            "start": 0,
            "end": 200,
            "density": 0.989
          },
          {
            "start": 200,
            "end": 500,
            "density": 0.0083
          },
          {
            "start": 500,
            "density": 0.0027
          }
        ],
        "percentiles": {
          "p75": 47
        }
      },
      "largest_contentful_paint_image_time_to_first_byte": {
        "percentiles": {
          "p75": 614
        }
      },
      "form_factors": {
        "fractions": {
          "phone": 0.3238,
          "tablet": 0,
          "desktop": 0.6762
        }
      },
      "largest_contentful_paint": {
        "histogram": [
          {
            "start": 0,
            "end": 2500,
            "density": 0.9576
          },
          {
            "start": 2500,
            "end": 4000,
            "density": 0.0259
          },
          {
            "start": 4000,
            "density": 0.0165
          }
        ],
        "percentiles": {
          "p75": 915
        }
      },
      "largest_contentful_paint_image_element_render_delay": {
        "percentiles": {
          "p75": 89
        }
      }
    },
    "collectionPeriod": {
      "firstDate": {
        "year": 2026,
        "month": 4,
        "day": 23
      },
      "lastDate": {
        "year": 2026,
        "month": 5,
        "day": 20
      }
    }
  }
}
```
