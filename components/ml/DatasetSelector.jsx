import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Upload } from "lucide-react";
import { motion } from "framer-motion";

const PREDEFINED_DATASETS = [
  { id: 1, name: "Iris Dataset", icon: "🌸", description: "Classic flower classification", samples: 150, features: 4 },
  { id: 2, name: "Diabetes Dataset", icon: "💊", description: "Medical diagnosis prediction", samples: 768, features: 8 },
  { id: 3, name: "Titanic Survival", icon: "🚢", description: "Survival prediction analysis", samples: 891, features: 11 },
  { id: 4, name: "MNIST Digits", icon: "🧮", description: "Handwritten digit recognition", samples: 70000, features: 784 },
  { id: 5, name: "Wine Quality", icon: "🍷", description: "Wine quality classification", samples: 1599, features: 11 },
  { id: 6, name: "Boston Housing", icon: "🏠", description: "House price prediction", samples: 506, features: 13 },
  { id: 7, name: "Breast Cancer", icon: "🧬", description: "Cancer diagnosis prediction", samples: 569, features: 30 },
  { id: 8, name: "Car Evaluation", icon: "🚗", description: "Car quality assessment", samples: 1728, features: 6 },
  { id: 9, name: "Student Performance", icon: "🎓", description: "Academic success prediction", samples: 395, features: 30 },
  { id: 10, name: "Credit Card Fraud", icon: "💳", description: "Fraud detection analysis", samples: 284807, features: 30 },
];

export default function DatasetSelector({ selectedDataset, onSelectDataset, onOpenUpload }) {
  return (
    <div>
      <h2 className="text-2xl font-semibold mb-4 text-gray-800">Select Dataset</h2>
      
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-6">
        {PREDEFINED_DATASETS.map((dataset, index) => (
          <motion.div
            key={dataset.id}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.05 }}
          >
            <Card
              onClick={() => onSelectDataset(dataset)}
              className={`cursor-pointer transition-all duration-300 hover:shadow-xl hover:-translate-y-1 ${
                selectedDataset?.id === dataset.id
                  ? "ring-4 ring-purple-500 bg-gradient-to-br from-purple-50 to-pink-50"
                  : "bg-white/80 backdrop-blur-sm hover:bg-white"
              }`}
            >
              <CardContent className="p-4 text-center">
                <div className="text-4xl mb-2">{dataset.icon}</div>
                <h3 className="font-semibold text-sm mb-1 text-gray-800">{dataset.name}</h3>
                <p className="text-xs text-gray-600 mb-2">{dataset.description}</p>
                <div className="flex justify-center gap-2 text-xs text-gray-500">
                  <span>{dataset.samples.toLocaleString()} rows</span>
                  <span>•</span>
                  <span>{dataset.features} features</span>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="flex justify-center">
        <Button
          onClick={onOpenUpload}
          variant="outline"
          size="lg"
          className="bg-white/80 backdrop-blur-sm hover:bg-white border-2 border-dashed border-purple-300 hover:border-purple-500 transition-all duration-300"
        >
          <Upload className="w-5 h-5 mr-2" />
          Upload Custom Dataset (CSV)
        </Button>
      </div>
    </div>
  );
}