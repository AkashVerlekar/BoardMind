from pydantic import BaseModel, Field

class BusinessHealthConfig(BaseModel):
    financial_weight: float = Field(default=0.5, description="Weight for Financial dimension (e.g. Revenue, Profit)")
    customers_weight: float = Field(default=0.3, description="Weight for Customers dimension (e.g. Churn, Growth)")
    employees_weight: float = Field(default=0.2, description="Weight for Employees dimension (e.g. Burnout, Turnover)")
    
    # Architecture supports future dimensions
    # operations_weight: float = 0.0
    # inventory_weight: float = 0.0
    # marketing_weight: float = 0.0
    
    def validate_weights(self):
        total = self.financial_weight + self.customers_weight + self.employees_weight
        if abs(total - 1.0) > 0.001:
            raise ValueError(f"Weights must sum to 1.0. Current sum: {total}")

default_health_config = BusinessHealthConfig()
