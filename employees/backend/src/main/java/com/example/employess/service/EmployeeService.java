package com.example.employess.service;

import com.example.employess.model.Employee;
import com.example.employess.repository.EmployeeRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class EmployeeService {

    @Autowired
    private EmployeeRepository employeeRepository;

    public List<Employee> getAllEmployees() {
        return employeeRepository.findAll();
    }

    public Employee getEmployeeById(Long id) {
        return employeeRepository.findById(id).orElse(null);
    }

    public Employee createEmployee(Employee employee) {
        return employeeRepository.save(employee);
    }

    public Employee updateEmployee(Long id, Employee employeeDetails) {
        Employee employee = employeeRepository.findById(id).orElse(null);
        if (employee != null) {
            employee.setNome(employeeDetails.getNome());
            employee.setCpf(employeeDetails.getCpf());
            employee.setData_nascimento(employeeDetails.getData_nascimento());
            employee.setEmail(employeeDetails.getEmail());
            employee.setData_deleted(employeeDetails.getData_deleted());
            return employeeRepository.save(employee);
        }
        return null;
    }

    public void deleteEmployee(Long id) {
        employeeRepository.deleteById(id);
    }
}
